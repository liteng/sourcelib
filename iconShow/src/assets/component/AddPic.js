import React, { createRef, useEffect, useRef, useState, useContext } from 'react';
import { Button, Upload, Select, Input, message, Modal, Form } from 'antd';
import { createIconsMap } from '../pages/Iconlib/createIconsMap';
import { ProTable, EditableProTable } from '@ant-design/pro-components';
import _ from 'lodash';
import { Add, Add2, Delete } from '../component/iconlib/react';
import { UserContext } from '../../UserContext';
import util from '../../util';
import ReactModal from 'react-modal';
import Config from '../../config';
import { get, post, upload } from '../../common/http';
import './AddPic.less';


ReactModal.setAppElement('#root');

const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;
const logoBasePath = `${sourceBasePath}/asset/logos`;

const token = util.getToken();

const AddPic = (props) => {
    const {
        open,
        onCancel
    } = props;

    const [attachList, setAttachList] = useState({});
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    // const [newAttachFilesInfo, setNewAttachFilesInfo] = useState([]);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const context = useContext(UserContext);
    const { user, login, logout } = context;

    const options = [];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onThumbnailUploadFinished = (updateInfo) => {
        console.log('--onThumbnailUploadFinished');
        console.log(updateInfo);
        if (updateInfo.file.status === 'error') {
            // TODO 弹登录对话框，登录对话框应该有全局状态来控制

        }
        if (updateInfo.file.status === 'done') {
            const fileName = updateInfo.file.name;
            message.success(`文件"${fileName}"已上传`);
            util.getBase64(updateInfo.file.originFileObj, (url) => {
                setThumbnailUrl(url);
            });

            // 后端返回新文件临时信息
            console.debug(updateInfo.file.response); // 服务端响应信息
            const newFileName = updateInfo.file.response.data.fileName;
            setThumbnailFile(newFileName);
        }
    }


    const handleChange = () => {
        
    }

    const onAttachUploadFinished = (updateInfo) => {
        console.log('--onAttachUploadFinished');
    // const onAttachUploadFinished = ({ file: newFile, fileList: newFileList }) => {
        // console.log(newFile);
        // setAttachList(newFileList);


        if (updateInfo.file.status === 'done') {
            const fileName = updateInfo.file.name;
            const fileFormat = fileName.substring(fileName.lastIndexOf('.') + 1);
            message.success(`文件"${fileName}"已上传`);
            // 后端返回新文件临时信息
            console.debug(updateInfo.file.response); // 服务端响应信息
            const fileId = updateInfo.file.response.data.fileId;
            const newFileName = updateInfo.file.response.data.fileName;
            // const attachFileIds = [...newAttachFileIds];
            // const attachFilesInfo = [...newAttachFilesInfo];
            // attachFileIds.push(newFileId);
            // attachFilesInfo.push({ fileId: newFileId, fileName: newFileName });
            // setNewAttachFileIds(attachFileIds);
            // setNewAttachFilesInfo(attachFilesInfo);
            // setNewFileId(newFileId);

            console.log('fileName: ', fileName);
            console.log('newFileName: ', newFileName);

            // 更新原资源列表信息
            const newAttachList = { ...attachList };
            console.debug(newAttachList);
            newAttachList[fileId] = {
                format: fileFormat,
                fileName: newFileName,
                orgName: fileName
            };
            setAttachList(newAttachList);
        } else if (updateInfo.file.status === 'error') {
            message.error(`文件"${updateInfo.file.name}"上传失败`);
            console.log(updateInfo.file.response); // 服务端响应信息
        }
    }

    const showPreview = (file) => {
        if(!file.url && !file.preview) {
            util.getBase64(file.originFileObj, (url) => {
                setPreviewImage(url);
                setPreviewOpen(true);
            })
        } else {
            setPreviewImage(file.url || file.preview);
            setPreviewOpen(true);
        }
        
    };

    const closePreview = () => {
        setPreviewOpen(false);
    }

    const removeAttach = (fileId) => {

        // 更新原资源列表信息
        const newAttachList = { ...attachList };
        if (newAttachList.hasOwnProperty(fileId)) {
            delete newAttachList[fileId];
        }
        setAttachList(newAttachList);
    }

    // const uploadSource = () => {
    //     const { fileList, onChange } = props;
    //     const [fileInfo, setFileInfo] = useState({});
    //     const [previewUrl, setPreviewUrl] = useState('');
    //     const [newAttachFile, setNewAttachFile] = useState(null);
    //     const [newAttachFileInfo, setNewAttachFileInfo] = useState({});
    //     const [newPreviewFile, setNewPreviewFile] = useState(null);
    //     const [uploading, setUploading] = useState(false);
    //     const [uploadError, setUploadError] = useState(false);
    //     const [uploadSuccess, setUploadSuccess] = useState(false);
    //     let isMounted = false;
    //     const handleUploadChange = (info) => {
    //         if (info.file.status === 'done') {
    //             if (info.file.response && info.file.response.url) {
    //                 setFileInfo({ ...fileInfo, url: info.file.response.url });
    //             } else if (info.file.error) {
    //                 message.error('上传图片出错');
    //             }
    //         } else if (info.file.status === 'uploading') {
    //             message.info('文件正在上传');
    //         } else if (info.file.status === 'error' || info.file.status === 'invalid') {
    //             if (info.file.errorNum === -1) {
    //                 message.error('上传图片失败');
    //             } else {
    //                 message.error('无效的文件或格式！');
    //             }
    //         }
    //     }
    //     const handlePreview = async () => {
    //         if (newPreviewFile) {
    //             const reader = new FileReader();
    //             reader.onloadend = function() {
    //                 setPreviewUrl(reader.result);
    //             }
    //             reader.readAsDataURL(newPreviewFile);
    //         } else if (previewUrl) {
    //             setPreviewUrl(previewUrl);
    //         } else if (fileInfo && fileInfo.url) {
    //             setPreviewUrl(fileInfo.url);
    // }

    // 上传头像文件
    const uploadThumbnail = async ({ file, onSuccess, onError }) => {
        console.log('uploadThumbnail');
        try {
            upload('upload/logo', file)
                .then(res => {
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

    // 上传资源文件
    const uploadSource = async ({ file, onSuccess, onError }) => {
        console.log('uploadSource');
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

    const uploadButton = (
        <div>
            <Add theme="filled" size={16} fill="#1F64FF" />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </div>
    );


    const onFinish = (values) => {
        console.log('Finish: ', values);
        const postValues = {
            // id: info.id,
            title: values.logoTitle,
            categoryId: values.logoCategory ?? null,    // TODO: 所属分类待实现
            // newSources: newAttachFileIds,
            sources: attachList,
            // removeSources: removeAttachFileIds,
            // sources: allSources,
            // thumbnail: newewThumbnailFileId,
            thumbnailFile: thumbnailFile,
            // thumbnail: values.thumbnailPic ? values.thumbnailPic[0].name : info.thumbnail,
            tag: values.logoTags ? values.logoTags : []
        };
        console.log('post data: ', postValues);
        post('/privatewebdata/addlogo', postValues)
            .then( res => {
                const result = res.data;
                if (result.success === true) {
                    // const data = result.data;
                    onCancel()
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.error(err.response)
                const orgErr = err.response;
                if (orgErr.data.code === 4001 || orgErr.data.code === '4001') {
                    message.error('提交logo信息失败！未通过身份验证，请重新登录后操作。');
                    logout();
                } else {
                    message.error('提交logo信息失败！');
                }
            })

        // fetch('https://localhost:10000/privatewebdata/addlogo', {
        //     method: "POST",
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     },
        //     body: JSON.stringify(postValues)
        // })
        //     .then(response => response.json())
        //     .then(result => {
        //         console.debug(result);
        //         if (result.success === true) {
        //             // const data = result.data;
        //             onCancel()
        //         } else {
        //             console.error(result.code, result.error);
        //         }
        //     }).catch(err => {
        //         console.error(err);
        //     });
    }

    
    useEffect( () => {
        // 获取所有logo类目
        console.debug("--get logo category data...");
        get('/publicwebdata/getalllogocategories')
            .then(res => {
                console.debug("--logoCategory data: ", res.data);
                const result = res.data;
                if (result.success === true) {
                    const categories = []
                    result.data.forEach(category => {
                        categories.push({
                            value: category.id,
                            label: category.name.zh
                        })
                    })
                    setCategories(categories);
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err => {
                console.error(err);
            });
    }, [])

    return <Modal
                footer={null}
                title="新增Logo"
                open={open}
                onCancel={onCancel}
                width={1024}
                mask={{backgroundColor: "rgba(0,0,0,0.25)"}}
                className="pic-add-content"
            >
                <div className="pic-add-wrapper">
                    <Form name="pic_edit" layout="vertical" onFinish={onFinish}>
                        <div className="new-logo-info-wrapper">
                            <div className="left-column">
                                <div className='preview-wrapper'>
                                    {/* <img id="piceditor_logo_img" className="piceditor-logo-img" src={thumbnailUrl} /> */}
                                    
                                    <Upload 
                                        customRequest={uploadThumbnail} 
                                        listType="picture-card" 
                                        onChange={onThumbnailUploadFinished} 
                                        showUploadList={false} 
                                        className='upload-thumbnail'
                                    >
                                        {thumbnailUrl ? <img src={thumbnailUrl} alt="预览" style={{ width: "100%", height: "100%" }} /> : <span className='upload-thumbnail-option'>更换缩略图</span>}
                                    </Upload>
                                    
                                </div>
                            </div>
                            <div className="right-column">
                                <Form.Item name="logoTitle" label="名称" rules={[{required: true, message: '名称为必填项'}]}>
                                    <Input rows={1} placeholder="Logo名称" maxLength={64} className={"piceditor-logo-title"} ></Input>
                                </Form.Item>
                                <Form.Item name="logoTags" label="标签" >
                                    <Select
                                        mode="tags"
                                        tokenSeparators={[',']}
                                        style={{
                                            width: '100%',
                                        }}
                                        placeholder="编辑标签"
                                        onChange={handleChange}
                                        options={options}
                                        open={false}
                                    />
                                </Form.Item>
                                <Form.Item name="logoCategory" label="所属分类" >
                                    <Select
                                        allowClear
                                        style={{
                                            width: '100%',
                                        }}
                                        placeholder="选择分类"
                                        options={categories}
                                    />
                                </Form.Item>
                                <div className="picviewer-logo-sources-list-wrapper">
                                    <span>添加资源</span>
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
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                if (Object.keys(attachList).length > 0) {
                                                    return Promise.resolve();
                                                }else {
                                                    return Promise.reject(new Error('需至少上传一个附件'));
                                                }
                                            }
                                        })
                                    ]}>
                                        <Upload 
                                            id="select_attach" 
                                            customRequest={uploadSource} 
                                            onChange={onAttachUploadFinished} 
                                            showUploadList={false} 
                                        >
                                            <Button >Upload</Button>
                                        </Upload>
                                    </Form.Item>

                                    

                                    {/* <Upload id="select_attach" action="https://localhost:10000/upload/logo" onChange={onAttachUploadFinished} showUploadList={false}>
                                        <Button >Upload</Button>
                                    </Upload>
                                    
                                    <ul className='picviewer-logo-sources-list'>
                                        {
                                            Object.keys(attachList).map(fileId => {
                                                console.log(fileId, attachList[fileId]);
                                                return (
                                                    <li key={fileId} className='logo-source-item'>
                                                        <span className={`format-pre ${attachList[fileId].format}`}>{attachList[fileId].fileName}</span>
                                                        <a className='remove-source' onClick={() => { removeAttach(fileId) }}><Delete theme="filled" size={16} fill="#1F64FF" /></a>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul> */}
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

export default AddPic;