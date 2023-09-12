import React, { createRef, useEffect, useRef, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { Form, Button, Input, Modal } from 'antd';
import Config from '../../config';

const serviceBasePath = Config.serviceBasePath;
const sourceBasePath = Config.sourceBasePath;
const logoBasePath = `${sourceBasePath}/asset/logos`;

const Login = (props) => {

    const {
        open,
        footer,
        onCancel,
        onSuccess
    } = props;
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Finish: ', values);
        const postValues = {
            account: values.account,
            passwd: values.passwd
        };
        console.log('post data: ', postValues);

        // fetch('https://localhost:10000/login', {
        fetch(`${serviceBasePath}/login`, {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
            },
            // credentials: 'include',
            withCredentials: true,
            body: JSON.stringify(postValues)
        })
            .then(response => response.json())
            .then(result => {
                console.debug(result);
                if(result.success === true) {
                    const data = result.data;
                    const userId = data.userId;
                    const account = data.account;
                    const token = data.token;
                    console.debug('登录成功相应数据: ',  data);
                    const tokenPayload = jwtDecode(token);
                    console.debug("base64编码token: ", tokenPayload);
                    onSuccess({userId: userId, account: account, token: token});
                    form.resetFields();
                } else {
                    console.error(result.code, result.error);
                }
            }).catch(err=>{
                console.error(err);
            });
    }

    return <Modal
        footer={footer}
        title="登录"
        open={open}
        onCancel={onCancel}
        width={512}
        mask="login-overlay"
        className="login-dialog"
    >
        <Form form={form} name="login" layout="vertical" onFinish={onFinish}>
             <Form.Item name="account" label="用户名" >
                 <Input rows={1} placeholder="用户名" maxLength={64} className={"piceditor-logo-title"} ></Input>
             </Form.Item>
             <Form.Item name="passwd" label="密码" >
                 <Input rows={1} placeholder="密码" maxLength={64} className={"piceditor-logo-title"} ></Input>
             </Form.Item>
             <div className='login-footer'>
                 <Button onClick={onCancel}>取消</Button>
                 <Button 
                     type="primary"
                     htmlType="submit">
                         确定
                 </Button>
             </div>
         </Form>
    </Modal>

    // return (
    //     <Form form={form} name="login" layout="vertical" onFinish={onFinish}>
    //         <Form.Item name="account" label="用户名" >
    //             <Input rows={1} placeholder="用户名" maxLength={64} className={"piceditor-logo-title"} ></Input>
    //         </Form.Item>
    //         <Form.Item name="passwd" label="密码" >
    //             <Input rows={1} placeholder="用户名" maxLength={64} className={"piceditor-logo-title"} ></Input>
    //         </Form.Item>
    //         <div>
    //             <Button onClick={onCancel}>取消</Button>
    //             <Button 
    //                 type="primary"
    //                 htmlType="submit">
    //                     确定
    //             </Button>
    //         </div>
    //     </Form>
    // )
}

export default Login;