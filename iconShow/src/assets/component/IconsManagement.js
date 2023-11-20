import React, { createRef, useEffect, useRef, useState } from 'react';
import { Button, Tooltip, Select, Input, message, Popconfirm, Modal } from 'antd';
import {createIconsMap } from '../pages/Iconlib/createIconsMap';
import { ProTable, EditableProTable } from '@ant-design/pro-components';
import _ from 'lodash';
import { Canvg } from 'canvg';
import { Add, Add2 } from '../component/iconlib/react';
import ReactModal from 'react-modal';
import Config from '../../config';
import { get, post } from '../../common/http';
import './IconsManagement.less';


ReactModal.setAppElement('#root');

const serviceBasePath = Config.serviceBasePath;

const IconsManagement = (props) => {
    const [iconCategoryEnum, setIconCategoryEnum] = useState(null);
    const [iconsMap, setIconsMap] = useState(null);
    const newCategoryCNRef = useRef(null);
    const newCategoryENRef = useRef(null);

    const {
        open,
        onCancel
    } = props;

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const columns = [
        {
            title: '',
            width: 32,
            dataIndex: 'id',
            editable: false,
            render: (text, record, _, action) => {
                return [
                    <record.Compnent key={`cmp-${text}`} theme='filled' size={16} fill={'#1F64FF'}/>
                ]
            }
        },
        {
            title: '名称',
            width: 140,
            dataIndex: 'title',
            editable: false,
            ellipsis: true,
        },
        {
            title: '标识',
            width: 160,
            dataIndex: 'name',
            editable: false,
            ellipsis: true,
        },
        {
            title: '分类',
            width: 140,
            key: 'categoryId',
            dataIndex: 'categoryId',
            ellipsis: true,
            valueType: 'select',
            valueEnum: iconCategoryEnum
        },
        {
            title: '标签',
            dataIndex: 'tag',
            ellipsis: true,
            valueType: 'text',
            render: (text, record) => {
                let tags = []
                record.tag.forEach((item, index) => {
                    tags.push(
                        <span key={'tag-' + index} className={"inner-icon-tag"}>{item}</span>
                    )
                })
                return tags;
            },
            renderFormItem: (props) => {
                const {entity, dataIndex} = props;
                const inputValue = entity[dataIndex].join(',');
                return <Input initialvalues={inputValue}></Input>;
            }
        },
        {
            title: '操作',
            width: 150,
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        console.log('record.id: ', record.id);
                        console.log("iconCategoryEnum: ", JSON.stringify(iconCategoryEnum));
                        action?.startEditable?.(record.id);
                    }}
                >
                    编辑
                </a>
            ]
        },
    ];

    const getIconsByKeyword = (keyword, event) => {
        console.debug("debug: get icons for ", keyword);
        // 判断是否点击"清除"引起的调佣
        if ( keyword === '') {
            // 获取全部图标
            // http.fetchRequest(`${serviceBasePath}/publicwebdata/getalliconslist`, {
            //     method: 'GET'
            // })
            //     .then(response => response.json())
            //     .then(result => {
            //         console.debug("--icons: ");
            //         console.debug(result);
            //         if(result.success === true) {
            //             const icons = createIconsMap(result.data);
            //             setIconsMap(icons);
            //         } else {
            //             console.error(result.code, result.error);
            //         }
            //     }).catch(err=>{
            //         console.error(err);
            //     });
            get('/publicwebdata/getalliconslist')
                .then( res => {
                    const result = res.data;
                    console.debug(result);
                    if (result.success === true) {
                        const icons = createIconsMap(result.data);
                        setIconsMap(icons);
                    } else {
                        console.error(result.code, result.error);
                    }
                }).catch(err => {
                    const orgErr = err.response
                    console.error(orgErr);
                });
        } else {
            // 根据keyword搜索
            // http.fetchRequest(`${serviceBasePath}/publicwebdata/geticonslistbykeyword/${keyword}`, {
            //     method: 'GET',
            // })
            //     .then(response => response.json())
            //     .then(result => {
            //         console.debug("--icons of ", keyword);
            //         console.debug(result);
            //         if(result.success === true) {
            //             const icons = createIconsMap(result.data);
            //             setIconsMap(icons);
            //         } else {
            //             console.error(result.code, result.error);
            //         }
            //     }).catch(err => {
            //         console.log(err);
            //     })

            get(`/publicwebdata/geticonslistbykeyword/${keyword}`)
                .then(res => {
                    const result = res.data;
                    console.debug("--icons of ", keyword);
                    console.debug(result);
                    if (result.success === true) {
                        const icons = createIconsMap(result.data);
                        setIconsMap(icons);
                    } else {
                        console.error(result.code, result.error);
                    }
                }).catch(err => {
                    const orgErr = err.response
                    console.error(orgErr);
                });
        }
        
    }

    const saveCategory = (e) => {
        if(newCategoryCNRef.current && 
            newCategoryENRef.current && 
            newCategoryCNRef.current.input.value.trim() !== '' && 
            newCategoryENRef.current.input.value.trim() !== '') {
            console.log(newCategoryCNRef.current.input.value, newCategoryENRef.current.input.value)
            // 提交数据
            // http.fetchRequest(`${serviceBasePath}/privatewebdata/addnewcategory`, {
            //     method: "POST",
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         categoryCN: newCategoryCNRef.current.input.value,
            //         categoryEN: newCategoryENRef.current.input.value
            //     })
            // })
            //     .then(response => response.json())
            //     .then(result => {
            //         console.debug(result.data);
            //         const data = result.data;
            //         if(result.success === true) {
            //             // 更新类别字典
            //             const {...iconCategory} = iconCategoryEnum;
            //             iconCategory[data.id] = {
            //                 text: data.name.cn,
            //                 en: data.name.en
            //             };
            //             setIconCategoryEnum(iconCategory);
            //         } else {
            //             console.error(result.code, result.error);
            //         }
            //     }).catch(err=>{
            //         console.error(err);
            //     });
            const postData = {
                categoryCN: newCategoryCNRef.current.input.value,
                categoryEN: newCategoryENRef.current.input.value
            };
            post('/privatewebdata/addnewcategory', postData)
                .then( res => {
                    const result = res.data;
                    console.debug(result);
                    if (result.success === true) {
                        const data = result.data;
                        // 更新类别字典
                        const { ...iconCategory } = iconCategoryEnum;
                        iconCategory[data.id] = {
                            text: data.name.cn,
                            en: data.name.en
                        };
                        setIconCategoryEnum(iconCategory);
                    } else {
                        console.error(result.code, result.error);
                    }
                }).catch(err => {
                    const orgErr = err.response
                    console.error(orgErr);
                });
        }
    }
    
    useEffect( () => {
        // 获取分类信息

        // http.fetchRequest(`${serviceBasePath}/publicwebdata/getallliconcategories`, {
        //     method: 'GET',
        // })
        //     .then(response => response.json())
        //     .then(result => {
        //         console.debug("--iconCategory: ");
        //         console.debug(result);
        //         if(result.success === true) {
        //             // const data = result.data;
        //             const data = {}
        //             Object.keys(result.data).forEach(key => {
        //                 data[key] = {
        //                     text: result.data[key].zh,
        //                     en: result.data[key].en,
        //                 }
        //             })
        //             console.log('iconCategoryEnum', data);
        //             setIconCategoryEnum(data);
        //         } else {
        //             console.error(result.code, result.error);
        //         }
        //     }).catch(err => {
        //         console.log(err);
        //     })
        get('/publicwebdata/getallliconcategories')
            .then( res => {
                const result = res.data;
                console.debug("--iconCategory: ");
                console.debug(result);
                if (result.success === true) {
                    // const data = result.data;
                    const data = {}
                    Object.keys(result.data).forEach(key => {
                        data[key] = {
                            text: result.data[key].zh,
                            en: result.data[key].en,
                        }
                    })
                    console.debug('iconCategoryEnum', data);
                    setIconCategoryEnum(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                const orgErr = err.response
                console.error(orgErr);
            });

        // 获取图标信息
        // http.fetchRequest(`${serviceBasePath}/publicwebdata/getalliconslist`, {
        //     method: 'GET',
        // })
        //     .then(response => response.json())
        //     .then(result => {
        //         console.debug("--all icons: ");
        //         console.debug(result);
        //         if(result.success === true) {
        //             const icons = createIconsMap(result.data);
        //             setIconsMap(icons);
        //         } else {
        //             console.error(result.code, result.error);
        //         }
        //     }).catch(err=>{
        //         console.error(err);
        //     });
        get('/publicwebdata/getalliconslist')
            .then( res => {
                const result = res.data;
                console.debug("--all icons: ");
                console.debug(result);
                if (result.success === true) {
                    const icons = createIconsMap(result.data);
                    setIconsMap(icons);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                const orgErr = err.response
                console.error(orgErr);
            });
    }, [])

    return <Modal
                footer={null}
                title="图标管理"
                open={open}
                onCancel={onCancel}
                width={1024}
                mask={{backgroundColor: "rgba(0,0,0,0.25)"}}
                className="icon-management-content"
            >
                <div className="icon-management-wrapper">
                    <div className="search-bar-wrap">
                        <Input.Search
                            className='icon-tool-search-input'
                            placeholder="输入关键词"
                            allowClear
                            enterButton="搜索"
                            onSearch={getIconsByKeyword}
                        />
                        <ul className="icon-management-toolbar">
                            <li>
                                <Tooltip title="新增图标类别">
                                    <Popconfirm
                                        title="新增图标类别"
                                        placement="bottomRight"
                                        okText="添加"
                                        cancelText="取消"
                                        icon={<Add2 theme="filled" size={16} fill="#99b7fc"/>}
                                        description={
                                            <div className="add-category-wrapper">
                                                <span className="category-name-label">图标类别中文</span>
                                                <Input ref={newCategoryCNRef} className="category-name-value" placeholder="输入中文类别名称" />
                                                <span className="category-name-label">图标类别英文</span>
                                                <Input ref={newCategoryENRef} className="category-name-value" placeholder="输入英文类别名称" />
                                            </div>
                                        }
                                        onConfirm={saveCategory}
                                    >
                                        <Button className='icon-tool-top-manage' icon={<Add theme="filled" size={16} fill="#1F64FF"/>}></Button>
                                    </Popconfirm>
                                </Tooltip>
                            </li>
                        </ul>
                    </div>
                    <div className="icon-list-wrap">
                        <EditableProTable 
                            className='icon-management-table'
                            rowKey="id"
                            recordCreatorProps={false}
                            pagination={
                                {pageSize: 10}
                            }
                            columns={columns}
                            value={iconsMap}
                            editable={{
                                type: 'multiple',
                                onSave: async (rowKey, data, row) => {
                                    console.log(rowKey, data, row);
                                    let icons = [...iconsMap];
                                    let icon = _.find(icons, {id: rowKey});
                                    icon.categoryId = data.categoryId;
                                    // icon.categoryCN = data.categoryCN;
                                    // icon.categoryEN = data.categoryEN;
                                    icon.categoryCN = iconCategoryEnum[data.categoryId].text;
                                    icon.categoryEN = iconCategoryEnum[data.categoryId].en;
                                    Array.isArray(data.tag) ? icon.tag = data.tag : icon.tag = data.tag.split(',').map(item => item.trim());
                                    // TODO: 保存至数据库
                                    console.debug('icon: ', icon);
                                    post('/privatewebdata/updateiconcategoryandtag', icon)
                                        .then( res => {
                                            const result = res.data;
                                            console.debug(result);
                                            if (result.success === true) {
                                                setIconsMap(icons);
                                            } else {
                                                message('修改图标信息失败！');
                                                console.error(result.code, result.error);
                                            }
                                        }).catch(err => {
                                            const orgErr = err.response
                                            console.error(orgErr);
                                        });
                                    // http.fetchRequest(`${serviceBasePath}/privatewebdata/updateiconcategoryandtag`, {
                                    //     method: "POST",
                                    //     headers: {
                                    //         'Content-Type': 'application/json'
                                    //     },
                                    //     body: JSON.stringify(icon)
                                    // })
                                    //     .then(response => response.json())
                                    //     .then(result => {
                                    //         console.debug(result);
                                    //         if(result.success === true) {
                                    //             setIconsMap(icons);
                                    //         } else {
                                    //             console.error(result.code, result.error);
                                    //         }
                                    //     }).catch(err=>{
                                    //         console.error(err);
                                    //     });
                                }
                            }}
                            search={false}
                        ></EditableProTable>
                    </div>
                </div>
            </Modal>

    
}

export default IconsManagement;