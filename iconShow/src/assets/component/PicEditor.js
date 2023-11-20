import React, { createRef, useEffect, useRef, useState, useContext } from 'react';
import { Button, Upload, Select, Input, message, Form, Modal } from 'antd';
import { Canvg } from 'canvg';
import { Delete } from '../component/iconlib/react';
import {Close2} from './iconlib/react';
import ReactModal from 'react-modal';
import util from '../../util';
import { UserContext } from '../../UserContext';
import { get, post, upload } from '../../common/http';
import Config from '../../config';
import './piceditor.less';
import { file } from 'jszip';
// import CopyPlugin from 'copy-webpack-plugin';

ReactModal.setAppElement('#root');

const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;
const logoBasePath = `${sourceBasePath}/asset/logos`;

const token = util.getToken();

const PicEditor = (props) => {

    const {
        open,
        info,
        onCancel
    } = props;
    console.log(info);



    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    // const [showModal, setShowModal] = useState(open);
    // const [sourceName, setSourceName] = useState(name);
    // const [sourcePath, setSourcePath] = useState(path);
    const [allSources, setAllSources] = useState(info.sources);
    const [attachList, setAttachList] = useState([]);
    const [thumbnailUrl, setThumbnailUrl] = useState(`${logoBasePath}${info.thumbnail}`);
    const [removeAttachFileIds, setRemoveAttachFileIds] = useState([]);
    const [newAttachFileIds, setNewAttachFileIds] = useState([]);
    const [newAttachFilesInfo, setNewAttachFilesInfo] = useState([]);
    const [newewThumbnailFileId, setNewThumbnailFileId] = useState(null);
    const [newThumbnailFile, setNewThumbnailFile] = useState(null);

    const context = useContext(UserContext);
    const { user, login, logout } = context;

    const options = [];
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    // 资源文件上传结束
    const onAttachUploadFinished = (updateInfo) => {
        if (updateInfo.file.status === 'done') {
            const fileName = updateInfo.file.name;
            const fileFormat = fileName.substring(fileName.lastIndexOf('.') + 1);
            message.success(`文件"${fileName}"已上传`);
            // 后端返回新文件临时信息
            console.debug(updateInfo.file.response); // 服务端响应信息
            const newFileId = updateInfo.file.response.data.fileId;
            const newFileName = updateInfo.file.response.data.fileName;
            // const attachFileIds = [...newAttachFileIds];
            const attachFilesInfo = [...newAttachFilesInfo];
            // attachFileIds.push(newFileId);
            attachFilesInfo.push({ fileId: newFileId, fileName: newFileName, orgName: fileName });
            // setNewAttachFileIds(attachFileIds);
            setNewAttachFilesInfo(attachFilesInfo);
            // setNewFileId(newFileId);

            // 更新原资源列表信息
            const newAttachList = {...attachList};
            console.debug(newAttachList);
            newAttachList[newFileId] = {
                format: fileFormat,
                fileName: newFileName,
                orgName: fileName
            };
            setAttachList(newAttachList);
        } else if (updateInfo.file.status === 'error') {
            let errorMsg = '';
            if (updateInfo.file.response.code === 4001 || updateInfo.file.response.code === '4001') {
                errorMsg = `文件"${updateInfo.file.name}"上传失败，身份验证失败`
                logout();
            }
            message.error(errorMsg);
            console.log(typeof updateInfo.file.response.code)
            console.log(updateInfo.file.response); // 服务端响应信息
        }
    }

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
      };

    // 上传头像文件
    const uploadThumbnail = async ({file, onSuccess, onError}) => {
        console.log('uploadThumbnail');
        console.log(user);
        try {
            upload('upload/logo', file)
                .then( res => {
                    console.debug('--upload thumbnail: ', res);
                    const data = res.data;
                    if (data.status === 401) {
                        throw new Error('401');
                    }
                    onSuccess(data);
                }).catch(err => {
                    console.error(err.response)
                    const orgErr = err.response;
                    if (orgErr.data.code === 4001 || orgErr.data.code === '4001') {
                        message.error('文件上传失败！未通过身份验证，请重新登录后操作。');
                        logout();
                    }else {
                        message.error('文件上传失败');
                    }
                })

        } catch (error) {
            // 在上传失败时执行 onError
            console.error(error);
            message.error('文件上传失败');
            onError(error);
        }
    }

    // 上传资源文件
    const uploadSource = async ({ file, onSuccess, onError }) => {
        console.log('uploadSource');
        console.log(user);
        try {
            upload('upload/logo', file)
                .then(res => {
                    console.debug('--upload source: ', res);
                    const data = res.data;
                    if (data.status === 401) {
                        throw new Error('401');
                    }
                    onSuccess(data);
                }).catch(err => {
                    console.error(err.response)
                    const orgErr = err.response;
                    if (orgErr.data.code === 4001 || orgErr.data.code === '4001') {
                        message.error('文件上传失败！未通过身份验证，请重新登录后操作。');
                        logout();
                    } else {
                        message.error('文件上传失败');
                    }
                })
        } catch (error) {
            // 在上传失败时执行 onError
            console.error(error);
            message.error('文件上传失败');
            onError(error);
        }
    }

    // 缩略图上传后更新页面上的缩略图
    const onThumbnailUploadFinished = (updateInfo) => {
        console.log('updateInfo: ', updateInfo);
        if (updateInfo.file.status === 'done') {
            const newFileName = updateInfo.file.response.data.fileName;
            // const newFileId = updateInfo.file.response.data.fileId;
            console.log(updateInfo);
            // setNewThumbnailFileId(newFileId);
            getBase64(updateInfo.file.originFileObj, (url) => {
                setThumbnailUrl(url);
            })
            setNewThumbnailFile(newFileName);
        }
    }

    const removeAttach = (fileId) => {
        const attachFileIds = [...removeAttachFileIds];
        const index = attachFileIds.indexOf(fileId);
        if(index === -1) {
             attachFileIds.push(fileId);
             setRemoveAttachFileIds(attachFileIds);
        }

        // 更新原资源列表信息
        const newAttachList = {...attachList};
        if(newAttachList.hasOwnProperty(fileId)) {
            delete newAttachList[fileId];
        }
        setAttachList(newAttachList);
    }

    const onFinish = (values) => {
        console.log('Finish: ', values);
        const postValues = {
            id: info.id,
            title: values.logoTitle ?  values.logoTitle : info.title,
            category: info.category,    // TODO: 所属分类待实现
            // newSources: newAttachFileIds,
            newSources: newAttachFilesInfo,
            removeSources: removeAttachFileIds,
            // sources: allSources,
            // thumbnail: newewThumbnailFileId,
            newThumbnailFile: newThumbnailFile,
            // thumbnail: values.thumbnailPic ? values.thumbnailPic[0].name : info.thumbnail,
            tag: values.logoTags ? values.logoTags : info.tag
        };

        console.log('post data: ', postValues);
        post('privatewebdata/updatelogo', postValues)
            .then(res => {
                const result = res.data;
                console.debug(result);
                if (result.success === true) {
                    onCancel()
                } else {
                    message('提交logo修改信息失败！')
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                const orgErr = err.response;
                message('提交logo修改信息失败！');
                console.error(orgErr)
            });
    }

    useEffect( () => {
        const newAttachList = {};
        Object.keys(info.sources).forEach(key => {
            const attach = {
                format: info.sources[key].format,
                fileName: info.sources[key].path.substring( info.sources[key].path.lastIndexOf('/') + 1),
                orgName: info.sources[key].orgName
            };
            newAttachList[key] = attach;
        });
        setAttachList(newAttachList);
    }, [])

    return < Modal
        footer = { null}
        title = "编辑Logo"
        open = { open }
        onCancel = { onCancel }
        width = { 1024}
        mask = {{ backgroundColor: "rgba(0,0,0,0.25)" }}
        className= "piceditor-content"
    >
        <span className="piceditor-close" onClick={onCancel}><Close2 theme="filled" size={32} fill="#ffffff" /></span>
        <div className="piceditor-wrapper">
            <Form name="pic_edit" layout="vertical" onFinish={onFinish}>
                <div className="piceditor-logo-info-wrapper">
                    <div className="left-column">
                        <div className='preview-wrapper'>
                            <img id="piceditor_logo_img" className="piceditor-logo-img" src={thumbnailUrl} alt={info.title} />
                        </div>
                        <Form.Item name="thumbnailPic" valuePropName="fileList" getValueFromEvent={normFile}>
                            {/* <Upload id="select_thumbnail" action="https://localhost:10000/upload/logo" onChange={onThumbnailUploadFinished} showUploadList={false} headers={{ 'Authorization': `Bearer ${token}` }}> */}
                            <Upload 
                                id="select_thumbnail" 
                                customRequest={uploadThumbnail} 
                                onChange={onThumbnailUploadFinished} 
                                showUploadList={false} 
                            >
                                <span className='upload-thumbnail-option'>更换缩略图</span>
                            </Upload>
                        </Form.Item>
                    </div>
                    <div className="right-column">
                        <Form.Item name="logoTitle" label="" >
                            <Input.TextArea rows={1} placeholder="Logo名称" maxLength={64} className={"piceditor-logo-title"} defaultValue={info.title}></Input.TextArea>
                        </Form.Item>
                        {/* <span className='piceditor-logo-title'>{info.title}</span> */}
                        <Form.Item name="logoTags" label="标签" >
                            <Select
                                mode="tags"
                                tokenSeparators={[',']}
                                style={{
                                    width: '100%',
                                }}
                                defaultValue={info.tag}
                                placeholder="编辑标签"
                                onChange={handleChange}
                                options={options}
                            />
                        </Form.Item>
                        <div className="picviewer-logo-sources-list-wrapper">
                            <span>下载资源</span>
                            <ul className='picviewer-logo-sources-list'>
                                {
                                    Object.keys(attachList).map(fileId => {
                                        console.log(fileId, attachList[fileId]);
                                        return (
                                            <li key={fileId} className='logo-source-item'>
                                                <span className={`format-pre ${attachList[fileId].format}`}>{attachList[fileId].orgName}</span>
                                                <a className='remove-source' onClick={() => { removeAttach(fileId) }}><Delete theme="filled" size={16} fill="#1F64FF" /></a>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <Form.Item name="attachPics" label="" valuePropName="fileList" getValueFromEvent={normFile} rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (Object.keys(attachList).length > 0) {
                                            return Promise.resolve();
                                        } else {
                                            return Promise.reject(new Error('需至少上传一个附件'));
                                        }
                                    }
                                })
                            ]}>
                                <Upload 
                                    id="select_attach" 
                                    customRequest={uploadSource} 
                                    action="https://localhost:10000/upload/logo" 
                                    onChange={onAttachUploadFinished} 
                                    showUploadList={false} 
                                >
                                    <Button >Upload</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <div>
                            <Button onClick={onCancel}>取消</Button>
                            <Button
                                type="primary"
                                htmlType="submit">
                                确定
                            </Button>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    </Modal>
}

export default PicEditor;