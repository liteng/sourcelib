import React, { createRef, useEffect, useRef, useState } from 'react';
import { Button, Upload, Select, Input, message, Form } from 'antd';
import {createIconsMap } from '../pages/Iconlib/createIconsMap';
import { ProTable } from '@ant-design/pro-components';
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
            dataIndex: 'category',
            ellipsis: true,
            valueType: 'select',
            valueEnum: {
                open: {
                text: '未解决',
                },
                closed: {
                text: '已解决',
                },
                processing: {
                text: '解决中',
                },
            },
        },
        {
            title: '标签',
            dataIndex: 'tags',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                key="editable"
                onClick={() => {
                    action?.startEditable?.(record.id);
                }}
                >
                编辑
                </a>
            ]
        },
    ];

    
    useEffect( () => {
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
                <ProTable 
                    columns={columns}
                    dataSource={iconsMap}
                    editable={{
                        type: 'multiple',
                    }}
                    search={false}
                    rowKey="id"
                ></ProTable>
            </div>
        </div>
        
    </ReactModal>
}

export default IconsManagement;