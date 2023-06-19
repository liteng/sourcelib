import React, { createRef, useEffect, useRef, useState } from 'react';
import { Col, InputNumber, Popover, Row, Slider, Input, Button, Dropdown, message, Tooltip } from 'antd';
import logoCategoryMap from './logoCategoryMap';
import logosMap from './logosMap';
import {More} from '../../component/iconlib/react';
import { Canvg } from 'canvg';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import './index.less';
import { Form } from 'react-router-dom';

// console.log('PUBLIC_URL:', process.env.PUBLIC_URL);

// Logo菜单
const items = [
    {
        label: '复制React代码',
        key: 'copyReactCode'
    },
    {
        label: '复制SVG',
        key: 'copySVG'
    },
    {
        label: '复制Png',
        key: 'copyPng'
    },
    {
        label: '下载SVG文件',
        key: 'downloadSvg'
    },
    {
        label: '下载Png文件',
        key: 'downloadPng'
    }
];


// Logo展示组件
const LogolibList = () => {
    const [iconSize, setIconSize] = useState(32);
    const [iconColor, setIconColor] = useState('#1F64FF');

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

    const downloadAllSvg = () => {
        const zip = new JSZip();
        iconsMap.forEach( item => {
            const blob = getSvgBlob(item.name);
            zip.file(item.name + '.svg', blob);
        })
        zip.generateAsync({type:'blob'}).then(blob => {
            saveAs(blob, 'svgIconlib.zip');
            message.info(`已下载全部Svg图标`);
        });
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
        console.log(element);
        if(key === 'copyReactCode') {
            const reactCode = `<${element.CompnentElement} theme="filled" size={${iconSize}} fill="${iconColor}"/>`;
            copyTextToClipboard(reactCode, 'reactCode');
        }
        if(key === 'copySVG') {
            const svgStr = getSvg(element.name);
            copyTextToClipboard(svgStr, 'svgCode');
        }
        if(key === 'copyPng') {
            copyPicToClipboard(element.name, 'png');
        }
        if(key === 'downloadSvg') {
            downloadSvg(element.name)
        }
        if(key === 'downloadPng') {
            downloadPng(element.name)
        }
    };
    

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
                                                <img src={'/public/logos'+ element.dir} alt={element.title} />
                                            </div>
                                            <div className='logo-details-wrapper'>
                                                <span className='logo-pic-format'>svg</span>
                                                <span className='logo-pic-format'>png</span>
                                            </div>
                                        </div>
                                        <div className='icon-info-wrapper'>
                                            <div className='icon-info-title'><span>{element.title}</span></div>
                                            <Dropdown menu={{items, onClick: ({key}) => {onClick(key, element)} }}>
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
            <canvas style={{display: "none"}} />
        </>
    )
}

export default LogolibList;
