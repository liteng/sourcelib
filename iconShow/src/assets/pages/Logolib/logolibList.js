import React, { useEffect, useContext, useState } from 'react';
import { Col, InputNumber, Popover, Row, Slider, Input, Button, Dropdown, message, Tooltip, Modal, Upload } from 'antd';
import { Edit } from '../../component/iconlib/react';
import {get} from '../../../common/http';
import {UserContext} from '../../../UserContext';
import {More} from '../../component/iconlib/react';
import { Canvg } from 'canvg';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import PicViewer from '../../component/PicViewer';
import PicEditor from '../../component/PicEditor';
import AddPic from '../../component/AddPic'
import Config from '../../../config';
import util from '../../../util';
import './index.less';
import { Form } from 'react-router-dom';
import { formatCountdown } from 'antd/es/statistic/utils';

const copyEnabled = ['SVG', 'PNG', 'JPG', 'JPEG', 'BMP', 'GIF', 'TIFF', 'WEBP'];
const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;
const logoBasePath = `${sourceBasePath}/asset/logos`;


// Logo展示组件
const LogolibList = () => {
    const [openDetails, setOpenDetails] = useState(false);
    const [openLogoInfoEdit, setOpenLogoInfoEdit] = useState(false);
    const [sourceName, setSourceName] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [sources, setSources] = useState({});
    const [currLogo, setCurrLogo] = useState({});
    const [logosMap, setlogosMap] = useState(null);
    const [logoCategoryMap, setLogoCategoryMap] = useState(null);
    const [currCatecory, setCurrCatecory] = useState("all");
    const [openAddNewLogo, setOpenAddNewLogo] = useState(false);

    const context = useContext(UserContext);
    const {user, login, logout} = context;

    const downLoadIconlib = () => {
        window.location.href='/downloads/iconlib.zip'
    }

    const getSvg = (id) => {
        const dom = document.getElementById(id).children[0];
        dom.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        return dom.outerHTML;
    }

    const getSvgBlob = (id) => {
        const svgStr = getSvg(id);
        const blob = new Blob([svgStr]);
        return blob;
    }

    const downloadSvg = (id) => {
        const blob = getSvgBlob(id);
        const url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = id + '.svg';
        a.click();
    }

    const getPng = (id, type) => {
        const svgStr = getSvg(id);
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        let v = null;
        // 读取svg
        v = Canvg.fromString(ctx, svgStr);
        // 在canvas上绘制svg
        v.start();
        
        if(type === 'base64') {
            let img = canvas.toDataURL("img/png");
            return img;
        }
        if(type === 'blob') {
            canvas.toBlob(blob => {
                return blob;
            })
        }
    }


    // 暂不提供上下文菜单
    // 如果提供svg资源可以复制为svg及png
    // 如果只提供png资源则只能复制为png
    // 如果未提供svg也未提供png资源，则复制thumbnail转化后的png
    // 所有提供的资源均可下载
    /* const dynamicMenu = (element) => {
        console.log('--dynamicMenu');
        const items = [];
        let svgKey = null;
        let pngKey = null;

        if(Object.keys(element.sources).length < 1) return items;

        Object.keys(element.sources).forEach( (key) => {
            svgKey = key.toUpperCase() === 'SVG' ? key : svgKey;
            pngKey = key.toUpperCase() === 'PNG' ? key : pngKey;
        });
        console.log(svgKey, pngKey);

        if(svgKey !== null && pngKey === null) {
            // 如果有svg资源，但没有png资源，svg:复制原图，png:复制由svg转换后的png
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(svgKey, `/public/logos${element.sources[svgKey]}`)} }>复制SVG</a>),
                    key: 'copySvg'
                }
            );
            items.push(
                {
                    label: (<a onClick={ () => {copySvgToPng(`#pic_${element.id}`, `/public/logos${element.sources[svgKey]}`)} }>复制PNG</a>),
                    key: 'copySvgToPng'
                }
            );
        } else if(svgKey !== null && pngKey !== null) {
            // 如果有svg资源，也有png资源，svg:复制原图，png:复制原图
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(svgKey, `/public/logos${element.sources[svgKey]}`)} }>复制SVG</a>),
                    key: 'copySvg'
                }
            );
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(pngKey, `/public/logos${element.sources[pngKey]}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );
        } else if(svgKey === null && pngKey !== null) {
            // 如果没有svg资源，有png资源，svg:不提供复制，png:复制原图
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(pngKey, `/public/logos${element.sources[pngKey]}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );

        } else {
            // 既没有svg资源，也没有png资源，png:复制原格式转换后的png
            items.push(
                {
                    label: (<a onClick={ () => {copyPic("other", `#pic_${element.id}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );
        }
        
        Object.keys(element.sources).forEach( (key) => {
            const menuItem = {
                label: <a href={`/public/logos${element.sources[key]}`} download={element.sources[key].substring(element.sources[key].lastIndexOf('/') + 1)}>下载{key.toUpperCase()}文件</a>,
                key: `download${key}`
            }
            items.push(menuItem);
        });
        return items;
    } */
    const dynamicMenu = (logo) => {
        // console.log('--dynamicMenu');
        const items = [];
        let svgKey = null;
        let pngKey = null;

        if(Object.keys(logo.sources).length < 1) return items;

        Object.keys(logo.sources).forEach( key => {
            svgKey = logo.sources[key].format.toUpperCase() === 'SVG' ? key : svgKey;
            pngKey = logo.sources[key].format.toUpperCase() === 'PNG' ? key : pngKey;
        });
        // console.log(svgKey, pngKey);

        if(svgKey !== null && pngKey === null) {
            // 如果有svg资源，但没有png资源，svg:复制原图，png:复制由svg转换后的png
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(logo.sources[svgKey].format, `${logoBasePath}${loog.sources[svgKey].path}`)} }>复制SVG</a>),
                    key: 'copySvg'
                }
            );
            items.push(
                {
                    label: (<a onClick={ () => {copySvgToPng(`#pic_${logo.id}`, `${logoBasePath}${logo.sources[svgKey].path}`)} }>复制PNG</a>),
                    key: 'copySvgToPng'
                }
            );
        } else if(svgKey !== null && pngKey !== null) {
            // 如果有svg资源，也有png资源，svg:复制原图，png:复制原图
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(logo.sources[svgKey].format, `${logoBasePath}${logo.sources[svgKey].path}`)} }>复制SVG</a>),
                    key: 'copySvg'
                }
            );
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(logo.sources[pngKey].format, `${logoBasePath}${logo.sources[pngKey].path}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );
        } else if(svgKey === null && pngKey !== null) {
            // 如果没有svg资源，有png资源，svg:不提供复制，png:复制原图
            items.push(
                {
                    label: (<a onClick={ () => {copyPic(logo.sources[pngKey].format, `${logoBasePath}${logo.sources[pngKey].path}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );

        } else {
            // 既没有svg资源，也没有png资源，png:复制原格式转换后的png
            items.push(
                {
                    label: (<a onClick={ () => {copyPic("other", `#pic_${logo.id}`)} }>复制PNG</a>),
                    key: 'copyPng'
                }
            );
        }
        
        Object.keys(logo.sources).forEach( (key) => {
            const menuItem = {
                label: <a href={`${logoBasePath}${logo.sources[key].path}`} download={logo.sources[key].path.substring(logo.sources[key].path.lastIndexOf('/') + 1)}>下载{logo.sources[key].format.toUpperCase()}文件</a>,
                key: `download_${key}`
            }
            items.push(menuItem);
        });
        return items;
    }

    const copyPic = async (logoKey, path) => {
        // console.debug(logoKey, path);
        // const logoSource = `/public/logos${sources[logoKey]}`;
        try {
            // let result = null;
            // const response = await fetch(logoSource);
            if(logoKey.toUpperCase() === 'SVG') {
                const response = await fetch(path);
                const result = await response.text();
                navigator.clipboard.writeText(result)
                .then(() => {
                    message.info(`已复制${logoKey.toUpperCase()}至剪贴板`);
                })
                .catch( error => {
                    message.error(`复制${logoKey.toUpperCase()}失败`);
                    console.error(error);
                })
            } else if(logoKey.toUpperCase() === 'PNG') {
                const response = await fetch(path);
                const result = await response.blob();
                const mimeType = result.type;
                // console.debug('mime type:', mimeType);
                const clipboardItemData = {};
                clipboardItemData[mimeType] = result;
                const img = new ClipboardItem(clipboardItemData);
                navigator.clipboard.write([img])
                .then(() => {
                    message.info(`已复制${logoKey.toUpperCase()}至剪贴板`);
                })
                .catch(error => {
                    message.error(`复制${logoKey.toUpperCase()}失败`);
                    console.error(error);
                });
            } else {
                // 其他格式需要转成png后再复制
                const img = document.querySelector(path);
                const canvas = document.querySelector('#logolib_convert_canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    // console.debug(blob);
                    const png = new ClipboardItem({ 'image/png': blob });
                    // 将剪贴板项写入剪贴板
                    navigator.clipboard.write([png])
                        .then(() => {
                            // 复制成功
                            message.info(`已复制PNG至剪贴板`);
                        })
                        .catch(error => {
                            // 复制失败
                            message.error(`复制PNG失败`);
                        });
                })
            }
        } catch(err) {
            message.error(`复制${logoKey.toUpperCase()}失败`);
            console.error(err);
        }
    }

    const copySvgToPng = async (domid, path) => {
        // console.debug(path);
        try{
            let result = null;
            const response = await fetch(path);
            result = await response.text();
            const img = document.querySelector(domid);
            const canvas = document.querySelector('#logolib_convert_canvas');
            // console.log('naturalWidth:', img.naturalWidth);
            // console.log('naturalHeight:', img.naturalHeight);
            // console.log('width:', img.width);
            // console.log('height:', img.height);
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            let v = null;
            // 读取svg
            v = Canvg.fromString(ctx, result);
            // 在canvas上绘制svg
            v.start();
            canvas.toBlob(blob => {
                const png = new ClipboardItem({"image/png": blob});
                navigator.clipboard.write([png])
                .then(() => {
                    message.info(`已复制PNG至剪贴板`);
                })
                .catch(error => {
                    message.error(`复制PNG失败`);
                    console.error(error);
                });
            })
        } catch(err) {
            message.error(`复制PNG失败`);
            console.error(err);
        }
    }

    const showDetails = (logo) => {
        // console.debug(logo);
        setSourcePath(`${logoBasePath}${logo.thumbnail}`);
        setSourceName(logo.title);
        setSources(logo.sources);
        setOpenDetails(true);
    }

    const handlePicViewerModelCancel = () => {
        setSourcePath('');
        setSourceName('')
        setOpenDetails(false);
    }

    const addLogo = () => {
        setOpenAddNewLogo(true);
    }

    const addLogoClose = () => {
        setOpenAddNewLogo(false);
        // getAllCategories();
        // getAllIcons();
    }

    const editLogoInfo = (logo) => {
        // console.debug(logo);
        setCurrLogo(logo);
        setOpenLogoInfoEdit(true);
    }

    const handlePicEditorModelCancel = () => {
        setOpenLogoInfoEdit(false);
    }

    const onUploadFinished = (info) => {
        if (info.file.status !== 'uploading') {
            // console.debug(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            // console.debug(info.file.response); // 服务端响应信息
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            // console.debug(info.file.response); // 服务端响应信息
          }
    }

    const generatePicFormatInfo = (logo) => {
        const formats = [];
        Object.keys(logo.sources).map( key => {
            let format = logo.sources[key].format;
            if( !formats.includes(format) ) {
                formats.push( 
                    <span key={`format_${logo.id}_${key}`} className={`logo-pic-format ${format}`}>{/* {format} */}</span>
                )
            }
        })
        return formats;
    }

    // 根据类目获取logo
    const getLogosByCategory = category => {
        // console.debug("--get logos for ", category);
        setCurrCatecory(category);
        get(`/publicwebdata/getlogosbycategory/${category}`)
            .then(res => {
                const result = res.data;
                // console.debug("--logos of ", category);
                // console.debug(result);
                if (result.success === true) {
                    const data = result.data;
                    setlogosMap(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.error(err);
            })
    }

    useEffect(() => {
        // 获取所有logo
        // console.debug("--get logos data...");
        get('/publicwebdata/getalllogos')
            .then(res => {
                // console.debug("--logos data: ", res.data);
                const result = res.data;
                if (result.success === true) {
                    const data = result.data;
                    setlogosMap(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.error(err);
            });

        // 获取所有logo类目
        // console.debug("--get logo category data...");
        get('/publicwebdata/getalllogocategories')
            .then(res => {
                // console.debug("--logoCategory data: ", res.data);
                const result = res.data;
                if (result.success === true) {
                    const data = result.data;
                    setLogoCategoryMap(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.error(err);
            });
    }, [])
    

    return (
        <>
            <div className='logo-wrapper'>
                <div className="logo-toolbar">
                    {
                        user && (
                            <Button onClick={addLogo}>新增</Button>
                        )
                    }
                </div>
                <div className='logo-list-wrapper'>
                    <ul className='logo-list'>
                        {
                            logosMap ? logosMap.map(logo => {
                                return (
                                    <li key={logo.id} className='logo-list-item'>
                                        <div className='logo-item-wrapper'>
                                            <div className='logo-img' onClick={()=>showDetails(logo)}>
                                                {/* <img id={`pic_${logo.id}`} src={`${logoBasePath}${logo.thumbnail}`} alt={logo.title} /> */}
                                                <img id={`pic_${logo.id}`} src={logo.thumbnail ? `${logoBasePath}${logo.thumbnail}` : ''} alt={logo.title} />
                                            </div>
                                            {
                                                user ? (
                                                    <div className='logo-options-wrapper'>
                                                        <a className='logo-option-btn' onClick={()=>editLogoInfo(logo)}><Edit theme="filled" size={16} /></a>
                                                    </div>
                                                ) : null
                                            }
                                            <div className='logo-details-wrapper'>
                                                { generatePicFormatInfo(logo) }
                                            </div>
                                        </div>
                                        <div className='icon-info-wrapper'>
                                            <div className='icon-info-title'><span>{logo.title}</span></div>
                                            <Dropdown menu={{items:dynamicMenu(logo) }}>
                                                <div className='icon-option-more'>
                                                    <div className='icon-more-wrapper'>
                                                        <More theme="filled" size={16} fill="#333333"/>
                                                    </div>
                                                </div>
                                            </Dropdown>
                                        </div>
                                    </li>
                                );
                            }) : <div>loading...</div>
                        }
                    </ul>
                </div>
                <div className='logo-tools-aside'>
                    <ul className='aside-category'>
                        <li key='all' className={currCatecory === 'all' ? 'aside-category-item category-active' : 'aside-category-item'}><a className='category-link' onClick={() => { getLogosByCategory('all') }}>全部</a></li>
                        {
                            logoCategoryMap ? logoCategoryMap.map(category => {
                                return (
                                    <li key={category.id} className={currCatecory === category.name.en ? 'aside-category-item category-active' : 'aside-category-item'}><a className='category-link' onClick={ () => { getLogosByCategory(category.id) }}>{category.name.zh}</a></li>
                                )
                            }) : <div>loading...</div>
                        }
                       
                    </ul>
                </div>
            </div>
            {/* <Modal centered 
                open={openDetails} 
                width="100%" 
                height="100%" 
                className='details-viewer' 
                footer={null}
                onCancel={handleModelCancel}>
            </Modal> */}
            {openDetails ? <PicViewer id="picviewer" open={openDetails} path={sourcePath} name={sourceName}  sources={sources} className="" onCancel={handlePicViewerModelCancel}/> : null}
            {openLogoInfoEdit ? <PicEditor id="piceditor" open={openLogoInfoEdit} info={currLogo} className="" onCancel={handlePicEditorModelCancel}/> : null}
            {openAddNewLogo ? <AddPic id="addpic" open={openAddNewLogo} className="" onCancel={addLogoClose} /> : null}
            <canvas id="logolib_convert_canvas" style={{display: "none"}} />
        </>
    )
}

export default LogolibList;
