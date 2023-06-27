import React, { createRef, useEffect, useRef, useState } from 'react';
import {Close2} from './iconlib/react';
import ReactModal from 'react-modal';
import './picviewer.less';

ReactModal.setAppElement('#xxx');
const PicViewer = (props) => {

    const {
        open,
        name,
        path,
        sources,
        onCancel
    } = props;
    console.log(open);
    console.log(name);
    console.log(path);
    console.log(sources);

    const [showModal, setShowModal] = useState(open);
    const [sourceName, setSourceName] = useState(name);
    const [sourcePath, setSourcePath] = useState(path);
    const [allSources, setallSources] = useState(sources);

    const downloadPng = (id) => {
        var url = getPng(id, 'base64');
        var a = document.createElement("a");
        a.href = url;
        a.download = id + '.png';
        a.click();
    }

    // return <Modal centered 
    //     open={open} 
    //     width="100%" 
    //     height="100%" 
    //     className='details-viewer' 
    //     footer={null}
    //     style={{overflow: 'hidden'}}
    //     onCancel={onCancel}>
    //     <img src={source} alt={name} />
    // </Modal>

    

    const dynamicDownloadItems = (allSources) => {
        const downloadItems = [];
        Object.keys(allSources).forEach( (key) => {
            downloadItems.push(<li key={`pv_download_${key}`} className='picviewer-tool-item' onClick={downloadDource()}><a>下载{key}文件</a></li>);
        });
        return downloadItems;
    }

    const dynamicCopyItems = (allSources) => {
        const copyItems = [];
        const copyEnabled = ['SVG', 'PNG', 'JPEG', 'BMP'];
        Object.keys(allSources).forEach( (key) => {
            if(copyEnabled.includes(key.toUpperCase())) {
                copyItems.push(<li key={`pv_copy_${key}`} className='picviewer-tool-item'><a>复制{key}</a></li>);
            }
        });
        return copyItems;
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
            <img className="piviewer-img" src={path} alt={name}  />
            <div className="picviewer-tools-wrapper">
                <ul className='picviewer-tools'>
                    { dynamicDownloadItems(sources) }
                </ul>
                <ul className='picviewer-tools'>
                    { dynamicCopyItems(sources) }
                </ul>
            </div>
            
        </div>
        
    </ReactModal>
}

export default PicViewer;