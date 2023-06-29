import React, { createRef, useEffect, useRef, useState } from 'react';
import { Col, InputNumber, Popover, Row, Slider, Input, Button, Dropdown, message, Tooltip, Modal } from 'antd';
import logoCategoryMap from './logoCategoryMap';
import logosMap from './logosMap';
import {More} from '../../component/iconlib/react';
import { Canvg } from 'canvg';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import PicViewer from '../../component/PicViewer';
import './index.less';
import { Form } from 'react-router-dom';
import { formatCountdown } from 'antd/es/statistic/utils';

const copyEnabled = ['SVG', 'PNG', 'JPG', 'JPEG', 'BMP', 'GIF', 'TIFF', 'WEBP'];


// Logo展示组件
const LogolibList = () => {
    const [iconSize, setIconSize] = useState(32);
    const [iconColor, setIconColor] = useState('#1F64FF');
    const [openDetails, setOpenDetails] = useState(false);
    const [sourceName, setSourceName] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [sources, setSources] = useState({});

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

    const downloadPng = (id) => {
        var url = getPng(id, 'base64');
        var a = document.createElement("a");
        a.href = url;
        a.download = id + '.png';
        a.click();
    }


    // 图标菜单点击
    const onClick = (key, element) => {
        console.log(key, element);
        if(key === 'copyPng') {
            const reactCode = `<${element.CompnentElement} theme="filled" size={${iconSize}} fill="${iconColor}"/>`;
            copyTextToClipboard(reactCode, 'reactCode');
        }
        if(key === 'copySVG') {
            const svgStr = getSvg(element.name);
            copyTextToClipboard(svgStr, 'svgCode');
        }
        if(key === 'copySvgToPng') {
            copyPicToClipboard(element.name, 'png');
        }
        if(key === 'download') {
            downloadSvg(element.name)
        }
        // if(key === 'downloadPng') {
        //     downloadPng(element.name)
        // }
    };



    // const dynamicCopyItems = (allSources) => {
    //     const copyItems = [];
    //     let svgKey = null;
    //     let pngKey = null;

    //     if(Object.keys(allSources).length < 1) return copyItems;
    //     Object.keys(allSources).forEach( (key) => {
    //         svgKey = key.toUpperCase() === 'SVG' ? key : svgKey;
    //         pngKey = key.toUpperCase() === 'PNG' ? key : pngKey;
    //     });
        
    //     if(svgKey !== null && pngKey === null) {
    //         // 如果有svg资源，但没有png资源，svg:复制原图，png:复制由svg转换后的png
    //         copyItems.push(
    //             <li key={'pv_copy_svg'} className='picviewer-tool-item'>
    //                 <a onClick={()=>copyPic(svgKey)}>复制SVG</a>
    //             </li>
    //         );
    //         copyItems.push(
    //             <li key={`pv_copy_png`} className='picviewer-tool-item'>
    //                 <a onClick={()=>copySvgToPng(svgKey)}>复制PNG</a>
    //             </li>
    //         );
    //     } else if(svgKey !== null && pngKey !== null) {
    //         // 如果有svg资源，也有png资源，svg:复制原图，png:复制原图
    //         copyItems.push(
    //             <li key={'pv_copy_svg'} className='picviewer-tool-item'>
    //                 <a onClick={()=>copyPic(svgKey)}>复制SVG</a>
    //             </li>
    //         );
    //         copyItems.push(
    //             <li key={'pv_copy_png'} className='picviewer-tool-item'>
    //                 <a onClick={()=>copyPic(pngKey)}>复制PNG</a>
    //             </li>
    //         );
    //     } else if(svgKey === null && pngKey !== null) {
    //         // 如果没有svg资源，有png资源，svg:不提供复制，png:复制原图
    //         copyItems.push(
    //             <li key={'pv_copy_png'} className='picviewer-tool-item'>
    //                 <a onClick={()=>copyPic(pngKey)}>复制PNG</a>
    //             </li>
    //         );

    //     } else {
    //         // 既没有svg资源，也没有png资源，png:复制原格式转换后的png
    //         copyItems.push(
    //             <li key={'pv_copy_other'} className='picviewer-tool-item'>
    //                 <a onClick={()=>copyPic("other")}>复制PNG</a>
    //             </li>
    //         );
    //     }
    //     return copyItems;
    // }



    const dynamicMenu = (element) => {
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
    }

    const copyPic = async (logoKey, path) => {
        console.log(logoKey, path);
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
                console.log('mime type:', mimeType);
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
                    console.log(blob);
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
        console.log(path);
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
        console.log(logo.path, logo.name);
        setSourcePath(`/public/logos${logo.dir}`);
        setSourceName(logo.title);
        setSources(logo.sources);
        setOpenDetails(true);
    }

    const handleModelCancel = () => {
        setSourcePath('');
        setSourceName('')
        setOpenDetails(false);
    }
    

    return (
        <>
            <div className='logo-wrapper'>
                <div className='logo-list-wrapper'>
                    <ul className='logo-list'>
                        {
                            logosMap.map(element => {
                                return (
                                    <li key={element.id} className='logo-list-item'>
                                        <div className='logo-item-wrapper'>
                                            <div className='icon-img'>
                                                <img id={`pic_${element.id}`} src={'/public/logos'+ element.dir} alt={element.title} onClick={()=>showDetails(element)}/>
                                            </div>
                                            <div className='logo-details-wrapper'>
                                                {
                                                    Object.keys(element.sources).map( (key) => <span key={`${element.id}_${key}`} className={`logo-pic-format ${key}`}>{key}</span> )
                                                }
                                            </div>
                                        </div>
                                        <div className='icon-info-wrapper'>
                                            <div className='icon-info-title'><span>{element.title}</span></div>
                                            <Dropdown menu={{items:dynamicMenu(element) }}>
                                                <div className='icon-option-more'>
                                                    <div className='icon-more-wrapper'>
                                                        <More theme="filled" size={16} fill="#333333"/>
                                                    </div>
                                                </div>
                                            </Dropdown>
                                        </div>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <div className='logo-tools-aside'>
                    <ul className='aside-category'>
                        <li className='aside-category-item'><a className='category-link' href='#'>行业用户</a></li>
                        <li className='aside-category-item'><a className='category-link' href='#'>机构</a></li>
                        <li className='aside-category-item'><a className='category-link' href='#'>厂商</a></li>
                        <li className='aside-category-item'><a className='category-link' href='#'>产品/服务</a></li>
                        <li className='aside-category-item'><a className='category-link' href='#'>内部</a></li>
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
            <PicViewer id="picviewer" open={openDetails} path={sourcePath} name={sourceName}  sources={sources} className="" onCancel={handleModelCancel}/>
            <canvas id="logolib_convert_canvas" style={{display: "none"}} />
        </>
    )
}

export default LogolibList;
