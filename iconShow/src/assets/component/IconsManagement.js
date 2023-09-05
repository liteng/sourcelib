import React, { createRef, useEffect, useRef, useState } from 'react';
import { Button, Upload, Select, Input, message, Form } from 'antd';
import {createIconsMap } from '../pages/Iconlib/createIconsMap';
import { ProTable, EditableProTable } from '@ant-design/pro-components';
import _ from 'lodash';
import { Canvg } from 'canvg';
import { Delete } from '../component/iconlib/react';
import {Close2} from './iconlib/react';
import ReactModal from 'react-modal';
import Config from '../../config';
import http from '../../common/http';
import './IconsManagement.less';


ReactModal.setAppElement('#xxx');

const serviceBasePath = Config.serviceBasePath;

const IconsManagement = (props) => {
    const [iconCategoryEnum, setIconCategoryEnum] = useState(null);
    const [iconsMap, setIconsMap] = useState(null);

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
            dataIndex: 'title',
            editable: false,
            ellipsis: true,
        },
        {
            title: '标识',
            dataIndex: 'name',
            editable: false,
            ellipsis: true,
        },
        {
            title: '分类',
            key: 'category',
            dataIndex: 'category',
            ellipsis: true,
            valueType: 'select',
            valueEnum: iconCategoryEnum,
            // render: (text, record) => [
            //     record.categoryCN
            // ]
        },
        {
            title: '标签',
            dataIndex: 'tag',
            ellipsis: true,
            valueType: 'text',
            render: (text, record) => {
                let tags = []
                record.tag.forEach(item => {
                    tags.push(
                        <span className={"inner-icon-tag"}>{item}</span>
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
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        console.log('record.id: ', record.id);
                        action?.startEditable?.(record.id);
                    }}
                >
                    编辑
                </a>
            ]
        },
    ];

    
    useEffect( () => {
        // 获取分类信息
        http.fetchRequest(`${serviceBasePath}/publicwebdata/getallliconcategories`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(result => {
                console.debug("--iconCategory: ");
                console.debug(result);
                if(result.success === true) {
                    // const data = result.data;
                    const data = {}
                    Object.keys(result.data).forEach(key => {
                        data[key] = {
                            text: result.data[key].zh
                        }
                    })
                    console.log('IconCategoryEnum', data);
                    setIconCategoryEnum(data);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.log(err);
            })

        // 获取图标信息
        http.fetchRequest(`${serviceBasePath}/publicwebdata/getalliconsList`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user?.token}`
            },
            withCredentials: true,
        })
            .then(response => response.json())
            .then(result => {
                console.debug("--all icons: ");
                console.debug(result);
                if(result.success === true) {
                    const icons = createIconsMap(result.data);
                    setIconsMap(icons);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err=>{
                console.error(err);
            });
    }, [])

    return <ReactModal
        isOpen={open}
        onRequestClose={onCancel}
        overlayClassName={"icon-management-overlay"}
        className="icon-management-content"
    >
        <span className="icon-management-close" onClick={onCancel}><Close2 theme="filled" size={32} fill="#ffffff"/></span>
        <div className="icon-management-wrapper">
            <div className="search-bar-wrap">
            <Input.Search
                className='icon-tool-search-input'
                placeholder="输入关键词"
                allowClear
                enterButton="搜索"
            />
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
                            icon.category = data.category;
                            icon.categoryCn = data.categoryCn
                            icon.tag = data.tag.split(',').map(item => item.trim());
                            // TODO: 保存至数据库
                            setIconsMap(icons);
                        }
                    }}
                    search={false}
                ></EditableProTable>
            </div>
        </div>
        
    </ReactModal>
}

export default IconsManagement;