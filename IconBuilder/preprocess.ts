import fs from 'fs';
import path from 'path';
import del from 'del';
import * as svgo from 'svgo';
import * as xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { copyFolder } from './utils/fsUtil';
import { SERVICE_BASE_PATH, NAV_ICON_LIB, ICON_LIB } from './config';
import axios from 'axios';
import https  from 'https';
import _ from 'lodash';

export interface IIconProps {
    id: string;
    title: string;
    name: string;
    svg: string;
    tag: string[];
    categoryId: string;
    categoryEN: string;
    categoryCN: string;
    author: string;
    rtl: boolean;
    CompnentElement: string;
}

let currIcons: IIconProps[] = [];

// 判断是否是色值
const isColor = (value: string | null): boolean => {
    if (!value) return false;
    const colorKeywords = ['red', 'green', 'blue'];
    const hexColorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const rgbColorRegex = /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/;
    const rgbaColorRegex = /^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*(0|1|0?\.\d+)\)$/;
    return (
        colorKeywords.includes(value) ||
        hexColorRegex.test(value) ||
        rgbColorRegex.test(value) ||
        rgbaColorRegex.test(value)
    );
}

// 解析svg文件名为元数据, [0]: 英文名称 [1]: 中文名称 [2]: ID
const parseAndChangeFileName = (filePath: string): string[] => {
    console.debug('++parseAndChangeFileName begain');
    const fileName = path.basename(filePath, '.svg');
    const names = fileName.split('#');
    const fileDir = path.dirname(filePath);
    const newFileName = `${names[0]}.svg`;
    const newFilePath = path.resolve(fileDir, newFileName);
    // console.log('filePath: ', filePath);
    // console.log('newFilePath: ', newFilePath);

    // 重命名svg文件为英文名
    fs.renameSync(filePath, newFilePath);
    // fs.copyFileSync(filePath, newFilePath);
    console.log('change file name: ', `${fileName}.svg -> ${names[0]}.svg`);
    console.debug('++parseAndChangeFileName end');
    return names;
}

// 解析svg并替换fill属性 --废弃！
const parseAndReplaceFill = (svg: string, color: string) => {
    console.debug('++parseAndReplaceFill begain');
    // console.debug('will replace fill: ', svg);
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder({headless: true});
    let svgString = svg;

    // 递归解析
    const replaceFill = (obj: any, color: string) => {
        // console.debug('parser obj: ', obj);
        if(obj.$ && obj.$.fill) {
            // console.debug(`${obj.$.fill} is Color: `, isColor(obj.$.fill));
            if(isColor(obj.$.fill)) {
                obj.$.fill = color;
            }
        }
        for(const key in obj) {
            if(typeof obj[key] === 'object') {
                replaceFill(obj[key], color);
            }
        }
        return obj;
    };

    // 开始解析并替换fill属性
    parser.parseString(svg, (err, result) => {
        if (err) {
            throw err;
        } else {
            // console.debug('parser result: ', result);
            replaceFill(result, color);
        }
        svgString = builder.buildObject(result);
    });

    console.debug('++parseAndReplaceFill end');
    return svgString;
}

// 初始化环境
const initEnv = async (libType: string) => {
    console.debug('++initEnv begain');
    // 删除Icons/iconlib, 清空Icons/svg目录
    const iconlibPath = path.resolve(__dirname, 'icons/' + libType);
    // const iconlibPath = path.resolve(__dirname, 'Icons/iconlib');
    const svgPath = path.resolve(__dirname, `${iconlibPath}/svg/**`)
    // const svgPath = path.resolve(__dirname, 'Icons/svg/**')
    console.debug('删除原编译目标文件开始\n', `${svgPath}`);
    // console.debug('删除原编译目标文件开始\n', `${iconlibPath}\n${svgPath}`);
    await del([iconlibPath]);
    // await del([iconlibPath, svgPath]);
    console.debug('删除原编译目标文件结束');
    // copy iconlib模板目录
    const tmpPath = path.resolve(__dirname, './iconlibTmp/' + libType);
    // const tmpPath = path.resolve(__dirname, './iconlibTmp');
    const tgtPath = path.resolve(__dirname, './icons/' + libType);
    // const tgtPath = path.resolve(__dirname, './Icons');
    console.debug('复制模板开始\n', `${tmpPath}  ->\n${tgtPath}`);
    const result = copyFolder(tmpPath, tgtPath, {isCover: true, isMakeDir: true});
    result ? console.debug('复制模板成功') : console.debug('复制模板失败');
    console.debug('++initEnv end');
    console.debug('获取当前图标库明细');
    const url = libType === NAV_ICON_LIB ? `${SERVICE_BASE_PATH}/publicwebdata/getallnaviconslist` : (libType === ICON_LIB ? `${SERVICE_BASE_PATH}/publicwebdata/getalliconslist` : '');
    console.debug(url);
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    await axios.get(url, {
        httpsAgent: agent,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        const result = res.data;
        if (result.success === true) {
            currIcons = result.data;
            // console.debug(currIcons);
        } else {
            console.error(result.code, result.error);
        }
    }).catch(err => {
        console.log(err);
        const orgErr = err.response
        console.error(orgErr);
    });
}

// 预处理svg文件
export const preprocess = async (libType: string) => {
    console.debug('++preprocess begain');
    await initEnv(libType);

    // 简易icon信息列表
    const iconsInfo: IIconProps[] = [];

    // 读取文件列表
    const svgTempDir = path.resolve(__dirname, 'SvgToBuild/' + libType);
    // const svgTempDir = path.resolve( __dirname, 'SvgToBuild' );
    console.debug('svg源目录: ', svgTempDir);
    // 目标目录
    const tgtDir = path.resolve(__dirname, `./icons/${libType}/svg`);
    // const tgtDir = path.resolve( __dirname, './Icons/svg');

    console.debug('读取原svg文件开始');
    fs.readdirSync(svgTempDir).forEach( file => {
        console.debug('读取svg: ', file);
        // 排除操作系统隐藏文件
        if( (/(^|\/)\.[^\/\.]/g).test(file) ) {
            return;
        }
        const filePath = path.resolve( svgTempDir, file);
        const tgtPath = path.resolve( tgtDir, file);
        const result = fs.readFileSync(filePath, {encoding: 'utf8'});
        
        console.debug('压缩svg: ', file);
        console.debug('--: ', fs.readFileSync(filePath, {encoding: 'utf8'}));
        // 压缩svg文件
        const svg = svgo.optimize(result, 
            {
                path: file, 
                plugins: [{
                    name: 'preset-default',
                    params: {
                        overrides: {
                            removeViewBox: false,
                            removeXMLProcInst:  false,
                            removeUnknownsAndDefaults: false,
                        }
                    }
                }]
            });
        console.log('optimize: ', svg.data);
    
        // 替换有效色值为'black'字符串
        // const svgString = parseAndReplaceFill(svg.data, 'black');
        // console.log('fill success: ', svgString);
        console.debug('新svg写入目标目录');
        // fs.writeFileSync(tgtPath, svgString, {encoding: 'utf8'});
        fs.writeFileSync(tgtPath, svg.data, { encoding: 'utf8' });
        // console.log('SVG file has been optimized.');
    
        const names = parseAndChangeFileName(tgtPath);
        // 在原图标库中查找该文件是否有对应图标
        const currIcon = _.find(currIcons, {id: names[2]});
        console.debug(currIcon);
        // 构建icon信息json，如果icon在库中已存在则读取原分类信息，否则赋默认分类
        let iconInfo: IIconProps | null = null; 
        if (currIcon) {
            iconInfo = {
                id: currIcon.id,
                title: names[1],
                name: names[0],
                svg: svg.data,
                tag: currIcon.tag,
                categoryId: currIcon.categoryId,
                categoryEN: currIcon.categoryEN,
                categoryCN: currIcon.categoryCN,
                author: currIcon.author,
                rtl: currIcon.rtl,
                CompnentElement: ''
            }
        } else {
            iconInfo = {
                id: names[2],
                title: names[1],
                name: names[0],
                svg: svg.data,
                tag: [
                    names[1]
                ],
                categoryId: "12733f05-df85-bf3f-5d76-7d7972d73e32",
                categoryEN: "Base",
                categoryCN: "基础",
                author: "USUE",
                rtl: false,
                CompnentElement: ''
            }
        }
        // const iconInfo = {
        //     // id: uuidv4(),
        //     id: names[2],
        //     title:  names[1],
        //     name: names[0],
        //     // svg: svgString,
        //     svg: svg.data,
        //     tag: [
        //         names[1]
        //     ],
        //     categoryId: "12733f05-df85-bf3f-5d76-7d7972d73e32",
        //     categoryEN: "Base",
        //     categoryCN: "基础",
        //     author: "USUE",
        //     rtl: false,
        //     CompnentElement: ''
        // }

        if(iconInfo) {
            iconsInfo.push(iconInfo)
        };
    });

    console.debug('++preprocess end');
    // console.debug('icons info: ', iconsInfo);
    return iconsInfo;
}

export default preprocess;
// 执行(for测试)
// preprocess();
// initEnv();


    
