import { Context } from "koa";
import path from "path";
import fs from "fs";
// import { Low } from 'lowdb'
import LowWithLodash from "../common/LowWithLodash.js";
import {JSONFile} from 'lowdb/node';
import { fileURLToPath } from "node:url";
import { SourceDb, IIconProps } from "../db/sourceDb.js"
import ErrorCode from "../common/ErrorCode.js";
import { config } from "../config.js";
import _ from "lodash";

interface ISource {
    [key:string]: {
        format: string;
        path: string;
    };
}


interface ILogoProps {
    id: string;
    title: string;
    category: string;
    sources: ISource;
    thumbnail: string;
    tag: string[];
}

interface ILogoCategoryProps {
    en: string;
    zh: string;
}

type Data = {
    logoCategory: ILogoCategoryProps[];
    logos: ILogoProps[]
}



export default class WebdataController {
    
    public static async test(ctx: Context) {
        console.info("--webdataController.getAllLogoCategory");

        console.debug(import.meta.url);
        const __dirname = path.dirname( fileURLToPath(import.meta.url) )
        // const dbFile = path.resolve(__dirname, '../../source/db/db.json');
        const dbFile = path.resolve(__dirname, config.lowDbPath)
        
        const adapter = new JSONFile<Data>(dbFile);
        const defaultData: Data = {logoCategory: [], logos: []};
        const db = new LowWithLodash<Data>(adapter, defaultData);
        
        
        await db.read();
        console.debug(db.data);
        /* db.data.logos.push(
            {
                "id": "zhongliangjituanyouxiangongsi",
                "title": "中粮集团有限公司",
                "category": "industrialCustomers",
                "sources": {
                    "dd07ae15-3b4b-476d-9fdd-4320a8e72155": {
                        "format": "svg",
                        "path": "/中粮集团有限公司.svg"
                    },
                    "afe690f5-5de9-441b-8700-fea3591fd797": {
                        "format": "png",
                        "path": "/中粮集团有限公司.png"
                    },
                    "d7a9a302-d0cc-4897-b2bf-36c38575ca36": {
                        "format": "ai",
                        "path": "/中粮集团有限公司.ai"
                    }
                },
                "thumbnail": "/中粮集团有限公司.png",
                "tag": [
                    "中粮集团有限公司"
                ]
            }
        ); */
        // const firstPost = db.data.logos[0];
        // console.debug(firstPost);
        

        // 查
        const logo = db.chain.get('logos').find({id: 'zhongliangjituanyouxiangongsi'}).value();
        console.log("Find",logo);
        
        // 改
        const result = db.chain.get('logos').find({id: 'zhongliangjituanyouxiangongsi3'}).assign({title: "Test"}).value();
        console.log("Modify:", result);

        await db.write();


        ctx.body = 'getLogoCategory ok';
    }

    // 获取所有logo数据
    public static async getAllLogos(ctx: Context) {
        console.info("--webdataController.getAllLogos");

        try {
            const db = await SourceDb.getSourceDb();
            const allLogos = db.chain.get('logos').value();
            // console.debug("logos: ", allLogos);

            console.log('cookie: ', ctx.cookies.get('token'));

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: allLogos,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 根据logo分类获取logo数据
    public static getLogosByCategory = async (ctx: Context) => {
        console.info("--webdataController.getLogosByCategory");

        try {
            const { category } = ctx.params;
            const db = await SourceDb.getSourceDb();
            const logos = "all" === category ? 
                db.chain.get('logos').value() : 
                db.chain.get("logos").filter({category: category}).value();
            // console.log(logos);

            console.log('cookie: ', ctx.cookies.get('token'));
            
            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: logos,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 获取所有logo分类数据
    public static async getAllLogoCategory(ctx: Context) {
        console.info("--webdataController.getAllLogoCategory");
        
        try{
            const db = await SourceDb.getSourceDb();
            const allLogoCategories = db.chain.get('logoCategory').value();
            console.debug("logoCategories: ", allLogoCategories);

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: allLogoCategories,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 更新Logo
    public static async updateLogo(ctx: Context) {
        console.info("--webdataController.updateLogo");

        type UpdateLogoData = {
            id: string;
            title: string;
            category: string;
            tag: string[];
            newSources: {fileId:string, fileName:string}[];
            removeSources: string[];
            newThumbnailFile: string | null;
        }
        const postData: UpdateLogoData = ctx.request.body;
        console.log(postData);

        try{
            const db = await SourceDb.getSourceDb();
            const orgLogo = db.chain.get('logos').find({id: postData.id}).value();
            let orgSources = {...orgLogo.sources};
            // 从logo资源目录删除指定的资源
            postData.removeSources.forEach(item => {
                if(orgSources.hasOwnProperty(item)) {
                    // delete orgSources[item];
                    const removeFilePath = config.logoStorePath + orgLogo.sources[item].path;
                    console.log("删除文件: ", removeFilePath);
                    fs.unlink(removeFilePath, (err) => {
                        if (err) throw err;
                        console.log(`${removeFilePath} was deleted`);
                    });
                }
            });
            
            let newSources: ISource = {};
            postData.newSources.forEach(item => {
                // 将增添的logo资源文件从临时目录移至资源目录
                console.log('移动文件: ', `${config.updateTempPath}/${item.fileName}`);
                fs.rename(`${config.updateTempPath}/${item.fileName}`, `${config.logoStorePath}/${item.fileName}`, (err) => {
                    if (err) throw err;
                    console.log(`${config.updateTempPath}/${item.fileName} was moved and renamed to ${config.logoStorePath}/${item.fileName}`);
                });
                // 构建新的logo资源数据-加入新增资源
                newSources[item.fileId] = {
                    format: item.fileName.substring(item.fileName.lastIndexOf('.') + 1),
                    path: `/${item.fileName}`
                };
            })
            // 构建新的logo资源数据-加入原有资源(不包含被删除资源)
            // 构建新的sourcess属性值
            Object.keys(orgSources).forEach(key => {   
                if(!postData.removeSources.includes(key)) {
                    newSources[key] = orgSources[key];
                }
            });
            // postData.newSources.forEach(item => {
            //     newSources[item.fileId] = {
            //         format: item.fileName.substring(item.fileName.lastIndexOf('.') + 1),
            //         path: item.fileName
            //     };
            // })
            // console.log(newSources);

            // db.chain.get('logos').find({id: postData.id}).set('sources', newSources).value();

            // db.write();

            
            // postData.newSources.forEach(item => {
            //     const source = {
            //         format: ,
            //         path: 
            //     }
            //     newSources.push();
            // })

            // 更新thumbnail
            if(postData.newThumbnailFile !== null) {
                console.log("更新缩略图: ", (`${config.updateTempPath}/${postData.newThumbnailFile}`));
                // 等tumbnail都移植到thumbnail目录后，实现删除原thumbnail文件
                fs.rename(`${config.updateTempPath}/${postData.newThumbnailFile}`, `${config.logoStorePath}/thumbnail/${postData.newThumbnailFile}`, (err) => {
                    if (err) throw err;
                    console.log(`${config.updateTempPath}/${postData.newThumbnailFile} was moved and renamed to ${config.logoStorePath}/thumbnail/${postData.newThumbnailFile}`);
                });
            }

            db.chain.get('logos')
                .find({id: postData.id})
                .assign({
                    title: postData.title,
                    category: postData.category,
                    tag: postData.tag,
                    sources: newSources,
                    thumbnail: postData.newThumbnailFile === null ? orgLogo.thumbnail : `/thumbnail/${postData.newThumbnailFile}`
                })
                .value();

            const testdb = db.chain.get('logos').find({id: postData.id}).value();
            console.log(testdb);

            db.write();
            // // const logo = db.chain.get("logos").filter({category: category}).value();
            // console.debug("logoCategories: ", allLogoCategories);

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: null,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 获取所有Icon分类数据
    public static async getAllIconCategory(ctx: Context) {
        console.info("--webdataController.getAllIconCategory");
        
        try{
            const db = await SourceDb.getSourceDb();
            const categories = db.chain.get('iconCategory').value();
            console.debug("categories: ", categories);
            const allIconCategories: {[key:string]: {[key:string]: string}} = {};
            categories.forEach( category => {
                allIconCategories[category.id] = {
                    "en": category.name.en,
                    "zh": category.name.zh
                }
            })
            console.debug("allIconCategories: ", allIconCategories);

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: allIconCategories,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 获取所有Icon数据(无归并)
    public static async getAllIconsList(ctx: Context) {
        console.info("--webdataController.getAllIconsList");

        try {
            const db = await SourceDb.getSourceDb();
            const allIcons = db.chain.get('icons').value();
            console.debug('all icons: ', allIcons.length);

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: allIcons,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 获取所有Icon数据(基于分类归并后的结果)
    public static async getAllIcons(ctx: Context) {
        console.info("--webdataController.getAllIcons");

        try {
            const db = await SourceDb.getSourceDb();

            const categories = db.chain.get('iconCategory').value();
            console.debug("categories: ", categories);
            // const allIconCategories: {[key:string]: {[key:string]: string}} = {};
            const allIcons: {[key:string]: IIconProps[]} = {};
            // categories.forEach( category => {
            //     allIconCategories[category.id] = {
            //         "en": category.name.en,
            //         "zh": category.name.zh
            //     }
            // });

            categories.forEach(category => {
                const categoryId = category.id;
                const subIcons = db.chain.get('icons').filter( {category: category.name.en} ).value();
                console.debug('subIcons: ', subIcons.length);
                if(subIcons.length > 0) {
                    // 如果无数据则无需汇总
                    allIcons[categoryId] = subIcons;
                }
            })



            // const iconCategory = db.chain.get('iconCategory').value();
            // console.debug(iconCategory);
            // const allIcons: {[key:string]: IIconProps[]} = {};
            // iconCategory.map( category => {
            //     const subIcons = db.chain.get('icons').filter( {category: category.name.en} ).value();
            //     allIcons[category.name.en] = subIcons;
            // })
            // console.debug(allIcons);
            // const allIcons = db.chain.get('icons').value();

            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: allIcons,
                error: null
            }
        } catch (err) {
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }

    // 根据关键字获取Icon数据(模糊匹配，需匹配name, title, tag三个属性)
    public static async getIconsByKeyword(ctx: Context) {
        console.info("--webdataController.getIconsByKeyword");

        try {
            const { keyword } = ctx.params;
            console.debug('keyword: ', keyword);
            const db = await SourceDb.getSourceDb();

            const categories = db.chain.get('iconCategory').value();
            const searchIcons: {[key: string]: IIconProps[]} = {};

            categories.forEach(category => {
                const categoryId = category.id;
                const subIcons = db.chain.get("icons").filter( {category: category.name.en} ).filter( post => {
                    console.debug('post: ', post);
                    // 尝试匹配name,title,tag,命中其中之一即算作匹配
                    const nmaeResult = post.name.includes(keyword);
                    const titleResult = post.title.includes(keyword);
                    const tagResult = post.tag.filter(item => {item.includes(keyword)}).length > 0 ? true : false;
                    // console.debug('nmaeResult: ', nmaeResult);
                    // console.debug('titleResult: ', titleResult);
                    // console.debug('tagResult: ', tagResult);
                    return nmaeResult || titleResult || tagResult;
                }).value();
                console.debug('subIcons: ', subIcons.length);
                if(subIcons.length > 0) {
                    // 如果无数据则无需汇总
                    searchIcons[categoryId] = subIcons;
                }
            })

            // const icons = db.chain.get("icons").filter( post => {
            //     console.debug('post: ', post);
            //     // 尝试匹配name,title,tag,命中其中之一即算作匹配
            //     const nmaeResult = post.name.includes(keyword);
            //     const titleResult = post.title.includes(keyword);
            //     const tagResult = post.tag.filter(item => {item.includes(keyword)}).length > 0 ? true : false;
            //     // console.debug('nmaeResult: ', nmaeResult);
            //     // console.debug('titleResult: ', titleResult);
            //     // console.debug('tagResult: ', tagResult);
            //     return nmaeResult || titleResult || tagResult;
            // }).value();
            // console.log(icons);

            // console.log('cookie: ', ctx.cookies.get('token'));
            
            ctx.status = 200;
            ctx.body = {
                code: ErrorCode.SUCCESS,
                success: true,
                data: searchIcons,
                error: null
            }
        } catch (err) {
            console.error(err);
            ctx.status = 500;
            ctx.body = {
                code: ErrorCode.SYS_ERROR,
                success: false,
                data: null,
                error: err
            }
        }
    }
    
}