import React, { createRef, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Download, Copy } from '../component/iconlib/react';
import { Canvg } from 'canvg';
import {Close2} from './iconlib/react';
import ReactModal from 'react-modal';
import Config from '../../config';
import './picviewer.less';
// import CopyPlugin from 'copy-webpack-plugin';

ReactModal.setAppElement('#root');

const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;
const logoBasePath = `${sourceBasePath}/asset/logos`;

const PicViewer = (props) => {

    const {
        open,
        name,
        path,
        sources,
        onCancel
    } = props;

    // const [showModal, setShowModal] = useState(open);
    // const [sourceName, setSourceName] = useState(name);
    // const [sourcePath, setSourcePath] = useState(path);
    // const [allSources, setallSources] = useState(sources);

    const downloadSource = async (path) => {
        const url = `${logoBasePath}${path}`;
        const response = await fetch(url);
        const data = await response.blob();
        const objectURL = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = objectURL;
        link.download = path.substring(path.lastIndexOf('/') + 1);
        link.click();
    }

    const dynamicDownloadItems = (allSources) => {
        const downloadItems = [];
        Object.keys(allSources).forEach( (key) => {
            downloadItems.push(
                <li key={`pv_download_${key}`} className='picviewer-tool-item'>
                    {/* <a className="" onClick={ () => {downloadSource(allSources[key].path)}} href={`${logoBasePath}${allSources[key].path}`} download={allSources[key].path.substring(allSources[key].path.lastIndexOf('/') + 1)}> */}
                    <a className="" onClick={ () => { downloadSource(allSources[key].path) } } >
                        <Download theme="filled" size={16} fill="#1F64FF"/>
                        <span> 下载 {allSources[key].format.toUpperCase()}文件</span>
                    </a>
                </li>
            );
        });
        return downloadItems;
    }

    const dynamicCopyItems = (allSources) => {
        // console.debug(allSources);
        const copyItems = [];
        // const copyEnabled = ['SVG', 'PNG', 'JPG', 'JPEG', 'BMP', 'GIF', 'TIFF', 'WEBP'];
        // let existPng = false;
        // let existSvg = false;
        let svgKey = null;
        let pngKey = null;

        if(Object.keys(allSources).length < 1) return copyItems;
        Object.keys(allSources).forEach( (key) => {
            svgKey = allSources[key].format.toUpperCase() === 'SVG' ? key : svgKey;
            pngKey = allSources[key].format.toUpperCase() === 'PNG' ? key : pngKey;
        });
        
        if(svgKey !== null && pngKey === null) {
            // 如果有svg资源，但没有png资源，svg:复制原图，png:复制由svg转换后的png
            copyItems.push(
                <li key={'pv_copy_svg'} className='picviewer-tool-item'>
                    <a onClick={()=>copyPic(allSources[svgKey].format, `${logoBasePath}${allSources[svgKey].path}`)}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 SVG</span>
                    </a>
                </li>
            );
            copyItems.push(
                <li key={`pv_copy_png`} className='picviewer-tool-item'>
                    <a onClick={()=>copySvgToPng(allSources[svgKey].format, `${logoBasePath}${allSources[svgKey].path}`)}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 PNG</span>
                    </a>
                </li>
            );
        } else if(svgKey !== null && pngKey !== null) {
            // 如果有svg资源，也有png资源，svg:复制原图，png:复制原图
            copyItems.push(
                <li key={'pv_copy_svg'} className='picviewer-tool-item'>
                    <a onClick={()=>copyPic(allSources[svgKey].format, `${logoBasePath}${allSources[svgKey].path}`)}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 SVG</span>
                    </a>
                </li>
            );
            copyItems.push(
                <li key={'pv_copy_png'} className='picviewer-tool-item'>
                    <a onClick={()=>copyPic(allSources[pngKey].format, `${logoBasePath}${allSources[pngKey].path}`)}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 PNG</span>
                    </a>
                </li>
            );
        } else if(svgKey === null && pngKey !== null) {
            // 如果没有svg资源，有png资源，svg:不提供复制，png:复制原图
            copyItems.push(
                <li key={'pv_copy_png'} className='picviewer-tool-item'>
                    <a onClick={()=>copyPic(allSources[pngKey].format, `${logoBasePath}${allSources[pngKey].path}`)}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 PNG</span>
                    </a>
                </li>
            );

        } else {
            // 既没有svg资源，也没有png资源，png:复制原格式转换后的png
            copyItems.push(
                <li key={'pv_copy_other'} className='picviewer-tool-item'>
                    <a onClick={()=>copyPic("other")}>
                        <Copy theme="filled" size={16} fill="#1F64FF"/>
                        <span> 复制为 PNG</span>
                    </a>
                </li>
            );
        }
        return copyItems;
    }

    const copyPic = async (format, path) => {
        // console.debug/(format, path);
        // const logoSource = `/public/logos${sources[logoKey]}`;
        try {
            // let result = null;
            // const response = await fetch(logoSource);
            if(format.toUpperCase() === 'SVG') {
                const response = await fetch(path);
                const result = await response.text();
                navigator.clipboard.writeText(result)
                .then(() => {
                    message.info(`已复制${format.toUpperCase()}至剪贴板`);
                })
                .catch( error => {
                    message.error(`复制${format.toUpperCase()}失败`);
                    console.error(error);
                })
            } else if(format.toUpperCase() === 'PNG') {
                const response = await fetch(path);
                const result = await response.blob();
                const mimeType = result.type;
                // console.debug('mime type:', mimeType);
                const clipboardItemData = {};
                clipboardItemData[mimeType] = result;
                const img = new ClipboardItem(clipboardItemData);
                navigator.clipboard.write([img])
                .then(() => {
                    message.info(`已复制${format.toUpperCase()}至剪贴板`);
                })
                .catch(error => {
                    message.error(`复制${format.toUpperCase()}失败`);
                    console.error(error);
                });
            } else {
                // 其他格式需要转成png后再复制
                const img = document.querySelector('#picviewer_source_img');
                const canvas = document.querySelector('#picviewer_convert_canvas');
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
            message.error(`复制${format.toUpperCase()}失败`);
            console.error(err);
        }
    }

    const copySvgToPng = async (logoKey) => {
        // console.debug(logoKey);
        const logoSource = `/public/logos${sources[logoKey]}`;
        try{
            let result = null;
            const response = await fetch(logoSource);
            result = await response.text();
            const img = document.querySelector('#picviewer_source_img');
            const canvas = document.querySelector('#picviewer_convert_canvas');
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

    return <ReactModal
        isOpen={open}
        onRequestClose={onCancel}
        overlayClassName={"picviewer-overlay"}
        className="picviewer-content"
    >
        <span className="picviewer-close" onClick={onCancel}><Close2 theme="filled" size={32} fill="#ffffff"/></span>
        <div className="picviewer-wrapper">
            <span className="pic-title">{name}</span>
            <img id="picviewer_source_img" className="piviewer-img" src={path} alt={name}  />
            <div className="picviewer-tools-wrapper">
                <ul className='picviewer-tools'>
                    { dynamicDownloadItems(sources) }
                </ul>
                <ul className='picviewer-tools'>
                    { dynamicCopyItems(sources) }
                </ul>
            </div>
            
        </div>
        <canvas id="picviewer_convert_canvas" style={{display: "none"}} />
        
    </ReactModal>
}

export default PicViewer;