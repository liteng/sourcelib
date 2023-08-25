import React, { createRef, useEffect, useRef, useState, useContext } from 'react';
import { Col, InputNumber, Popover, Row, Slider, Input, Button, Dropdown, message, Tooltip } from 'antd';
import { SketchPicker } from 'react-color';
import { Link, Element} from 'react-scroll';
import {createIconsMap, createIconsSet } from './createIconsMap';
import {More, Copy} from '../../component/iconlib/react';
import { Canvg } from 'canvg';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import '../../component/iconlib/react/styles/index.less'
import './index.less';
import { Form } from 'react-router-dom';

import Config from '../../../config';
import {UserContext} from '../../../UserContext';
import http from '../../../common/http';

const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;

// 图标菜单
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

const downloadMenuItems = [
    {
        label: '下载所有Svg图标',
        key: 'downLoadAllSvg'
    },
    {
        label: '下载所有Png图标',
        key: 'downloadAllPng'
    }
];


// 尺寸调节器组件
const SizeRegulator = (props) => {
    const {
        onChange: onOuterChange, 
        value: outerValue
    } = props;
    const [inputValue, setInputValue] = useState();
    const onchange = (newValue) => {
        setInputValue(newValue);
        onOuterChange(newValue);
    };

    useEffect(() => {
        setInputValue(outerValue)
    }, [outerValue]);

    return (
        <div className='icon-resize-wrapper'>
            <Slider className='icon-size-slider' min={12} max={48} value={typeof inputValue === "number" ? inputValue : 32} onChange={onchange}/>
            <InputNumber className='icon-size-number-input' min={12} max={48} value={inputValue} onChange={onchange}/>
        </div>
    );
}

const IconlibList = () => {
    const [iconSize, setIconSize] = useState(32);
    const [iconColor, setIconColor] = useState('#1F64FF');
    const [iconsMap, setIconsMap] = useState(null);
    const [iconsSet, setIconsSet] = useState(null);   // Test
    const [iconCategoryMap, setIconCategoryMap] = useState(null);
    // const iconColorInput = useRef(null);

    const context = useContext(UserContext);
    const {user} = context;

    const onSizeRegulatorChange = (newValue) => {console.log('onSizeRegulatorChange: ', newValue)
        setIconSize(newValue);
    }

    const onColorChanged = (newColor) => {
        setIconColor(newColor.hex);
    }

    const handleColorInputChange = (e) => {
        const {value: inputValue} = e.target;
        const reg = /(^#[0-9A-F]{6}$)/i; //|(^#[0-9A-F]{3}$)
        if(reg.test(inputValue)) {
            setIconColor(inputValue);
            iconColorInput.current.setInputValue = inputValue;
        }else{
            setIconColor('#1F64FF');
            iconColorInput.current.value = '#FFFFFF';
        }
    }

    const setDefaultSetup = () => {
        setIconSize(32);
        setIconColor('#1F64FF');
    }

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

    const downloadAllPng = () => {
        const zip = new JSZip();
        iconsMap.forEach( item => {
            const url = getPng(item.name, 'base64');
            const base64 = url.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
            const binary = window.atob(base64);
            const bytes = new Uint8Array(binary.length);
            for(let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], {type: "image/png"});
            const file = new File([blob], item.name + '.png');
            zip.file(file.name, file, {base64: true});
        })
        zip.generateAsync({type:'blob'}).then(blob => {
            saveAs(blob, 'pngIconlib.zip');
            message.info(`已下载全部Png图标`);
        });
    }

    const copyTextToClipboard = (content, type) => {
        navigator.clipboard.writeText(content).then(() => {
            navigator.clipboard.readText().then(clipText => {
                if(type === 'reactCode') {
                    message.info(`已复制React code至剪贴板: ${clipText}`);
                }
                if(type === 'svgCode') {
                    message.info(`已复制SVG至剪贴板`);
                }
                if(type== 'iconName') {
                    message.info(`已复制图标名称: ${clipText}`);
                }
            })
        })
    }

    const copyPicToClipboard = (id, type) => {

        const img = getPng(id, 'blob');
        const canvas = document.querySelector('canvas');
        canvas.toBlob(blob => {
            console.log(blob);
            let img = null;
            if(type === 'png') {
                img = new ClipboardItem({ 'image/png': blob });
            }
            
            // 将剪贴板项写入剪贴板
            navigator.clipboard.write([img])
                .then(() => {
                    // 复制成功
                    message.info(`已复制Png至剪贴板`);
                })
                .catch(error => {
                    // 复制失败
                    message.error(`复制Png失败`);
                });
        })
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


    const downloadMenuClick = (e) => {
        if(e.key === 'downLoadAllSvg') {
            downloadAllSvg();
        }
        if(e.key === 'downloadAllPng') {
            downloadAllPng();
        }
    };

    const menuProps = {
        items: downloadMenuItems,
        onClick: downloadMenuClick
    }

    const getIconsByKeyword = keyword => {
        console.debug("debug: get icons for ", keyword);
        // setCurrCatecory(category);
        http.fetchRequest(`${serviceBasePath}/publicwebdata/geticonsbykeyword/${keyword}`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(result => {
                console.debug("--icons of ", keyword);
                console.debug(result);
                if(result.success === true) {
                    const data = result.data;
                    const iconsset = createIconsSet(data);
                    setIconsSet(iconsset);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const renderIconSet = (categoryId, icons) => {console.debug(icons);
        return(
            <>
                <Element key={iconCategoryMap[categoryId].en} name={iconCategoryMap[categoryId].en}>{iconCategoryMap[categoryId].zh}</Element>
                <ul className='icon-list'>
                {
                    // iconsMap && iconsMap.map(element => {
                    icons.map(element => {
                        return (
                            <li key={element.id} className='icon-list-item'>
                                <div className='icon-item-wrapper'>
                                    <div className='icon-img'>
                                        <element.Compnent id={element.name} theme='filled' size={iconSize} fill={iconColor}/>
                                    </div>
                                    <div className='icon-info-wrapper'>
                                        <div className='icon-info-title'><span>{element.title}</span></div>
                                        <div className='icon-info-name'>
                                            <Tooltip title={element.name}><span>{element.name}</span></Tooltip>
                                            <span className='copy-option' onClick={() => {copyTextToClipboard(element.name, 'iconName')}}><Copy theme="filled" size={12} fill="#1F64FF"/></span>
                                        </div>
                                        <Dropdown menu={{items, onClick: ({key}) => {onClick(key, element)} }}>
                                            <div className='icon-option-more'>
                                                <div className='icon-more-wrapper'>
                                                    <More theme="filled" size={16} fill="#333333"/>
                                                </div>
                                            </div>
                                        </Dropdown>
                                    </div>
                                </div>
                            </li>
                        );
                    })
                }
                </ul>
            </>
        )
        
    }

    useEffect(()=>{
        // const icons = createIconsMap();
        // setIconsMap(icons);

        // 获取icon类型字典
        console.log("get icons category...");
        http.fetchRequest(`${serviceBasePath}/publicwebdata/getallliconcategories`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(result => {
                console.debug("--iconCategory: ");
                console.debug(result);
                if(result.success === true) {
                    const data = result.data;
                    setIconCategoryMap(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.log(err);
            })

        // 获取图标
        console.log("get icons data...");
        fetch(`${serviceBasePath}/publicwebdata/getallicons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user?.token}`
            },
            withCredentials: true,
        })
            .then(response => response.json())
            .then(result => {
                console.debug("--icons: ");
                console.debug(result);
                if(result.success === true) {
                    const data = result.data;
                    const iconsMap = {};
                    Object.keys(data).forEach( (key) => {
                        const icons = createIconsSet(data[key]);
                        iconsMap[key] = icons;
                    });
                    // const iconsMap = createIconsSet(icons);
                    setIconsMap(iconsMap);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err=>{
                console.error(err);
            });
    },[])

    return (
        <>
            <div className='icon-wrapper'>
                <div className='icon-category-aside'>
                    <ul className='icon-category-wrapper'>
                        {
                            iconsMap && Object.keys(iconsMap).map( categoryId => {
                                return <li key={categoryId} className='icon-category'><Link to={iconCategoryMap[categoryId].en} smooth={true} duration={500} >{iconCategoryMap[categoryId].zh}</Link></li>
                            })
                            // iconCategoryMap && iconCategoryMap.map( category => {
                            //     return (
                            //         <li key={category.id} className='icon-category'><Link to={'#' + category.name.en} smooth={true} duration={500} >{category.name.zh}</Link></li>
                            //     )
                            // })
                        }
                        {/* <li className='icon-category'><a>基础</a></li>
                        <li className='icon-category'><a>安全</a></li> */}
                    </ul>
                </div>
                <div className='icon-list-wrapper'>
                    <Button onClick={()=>{getIconsByKeyword('关于a')}} >TEST keyword</Button>
                    {
                        iconsMap && Object.keys(iconsMap).map( categoryId => {
                            // return <span>sdfsdfsdfsd</span>
                            return renderIconSet(categoryId, iconsMap[categoryId])
                        })
                    }
                </div>
                <div className='icon-tools-aside'>
                    {/* <Form name="icon-setup" > */}
                        {/* <div className='icon-download'>
                            <Button type='primary' className='download-btn' onClick={downLoadIconlib}>下载图标库包(React)</Button>
                        </div> */}
                        <div className='icon-download'>
                            <Dropdown.Button type='primary' className='download-btn' menu={menuProps} onClick={downLoadIconlib}>
                                下载图标库包(React)
                            </Dropdown.Button>
                        </div>
                        {/* <div className='icon-download'>
                            <Button type='primary' className='download-btn' onClick={downloadAllSvg}>下载图标库包(SVG)</Button>
                        </div> */}
                        <div className='icon-tools-wrapper'>
                            <div className='icon-setup'>
                                <div className='icon-tool-size'>
                                    <h2 className='tool-title'>图标大小</h2>
                                    <div className='tool-content'>
                                        <SizeRegulator value={iconSize} onChange={onSizeRegulatorChange}/>
                                    </div>
                                </div>
                                <div className='icon-tool-color'>
                                    <h2 className='tool-title'>图标颜色</h2>
                                    <div className='tool-content'>
                                        <Popover
                                            placement='top'
                                            content={<SketchPicker color={iconColor} disableAlpha={true} onChangeComplete={onColorChanged} />}
                                            title="选择颜色"
                                            trigger="click"
                                        >
                                            <div className='icon-color-preview' style={{backgroundColor: iconColor}}></div>
                                        </Popover>
                                        <span className='icon-color-span'>{iconColor}</span>
                                        {/* <Input className='icon-color-input' disabled={true} onBlur={handleColorInputChange} maxLength={7} value={iconColor} /> */}
                                    </div>
                                </div>
                                <div className='icon-tool-reset'>
                                    <Button className='icon-reset-btn' onClick={setDefaultSetup}>恢复默认配置</Button>
                                </div>
                            </div>
                        </div>
                    {/* </Form> */}
                </div>
            </div>
            <canvas style={{display: "none"}} />
        </>
    )
}

export default IconlibList;
