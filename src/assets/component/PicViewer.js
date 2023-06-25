import React, { createRef, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';

const PicViewer = (props) => {

    const {
        open,
        name,
        source,
        onCancel
    } = props;

    const [showModal, setShowModal] = useState(open);

    return <Modal centered 
        open={showModal} 
        width="100%" 
        height="100%" 
        className='details-viewer' 
        footer={null}
        onCancel={onCancel}>
        <img src={source} alt={name} />
    </Modal>
}

export default PicViewer;