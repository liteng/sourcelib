import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { HashRouter as Router, Route, Link, NavLink, Routes } from 'react-router-dom';
import {Button, Modal} from 'antd';
import routers from './router/routers';
import { UserContext } from './UserContext';
import { UserProvider } from './UserContext';
import Login from './assets/component/Login';
import 'antd/dist/reset.css';
import './style/index.less';
import { ColumnWidthOutlined } from '@ant-design/icons';
import Header from './assets/component/Header';



const App = () => {

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const context = useContext(UserContext);
    console.log("context:" ,context);
    const {login} = context;
    // const UserContext = createContext();
    // const context = useContext(UserContext);
    // const {user, login} = context;
    // const UserProvider = ({children}) => {
    //     const [user, setUser] = useState(null);
    //     const login = (userInfo) => {
    //         const newUserInfo = {...userInfo};
    //         setUser(newUserInfo);
    //     }
    //     const logout = () => {
    //         setUser(null);
    //     }
    //     const value = {user, login, logout};
    //     return <UserContext.Provider value={value}>{children}</UserContext.Provider>
    // }

    const openLoginModal = (event) => {
        event.preventDefault();
        setShowLoginModal(!showLoginModal);
    }
    
    // 登录成功, 更新Context、sessionStorage、关闭登录对话框
    const onLoginSuccessed = (userInfo) => {
        console.log(userInfo);
        // setIsLogin(true);
        // setUserInfo({userId:userInfo.userId, account: userInfo.account});
        // 更新Context 
        login(userInfo);
        // 写入浏览器
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        // 关闭登录对话框
        setShowLoginModal(false);
    }

    const onLoginCanceled = () => {
        setShowLoginModal(false);
    }

    useEffect( () => {
        // 验证是否在线
        // const cookies = util.getCookie();
        // console.log('cookies: ', cookies);
        // const token = cookies.token;
        // if(token) {
        //     setIsLogin(true);
        //     // 获取在线状态的用户名
        //     const tokenPayload = util.getJwttokenPayload(cookies.token);
        //     login({userId:tokenPayload.userId, account: tokenPayload.account})
        //     // setUserInfo({userId:tokenPayload.userId, account: tokenPayload.account});
        // }
    }, [])

    return (
        <>
            <Router>
                <Header openLogin={openLoginModal}></Header>
                {/* <div className='header'>
                    <div className='logo'></div>
                    <div className="head-blank"></div>
                    <NavLink className={({isActive}) => isActive ? 'head-nav-link head-nav-active' : 'head-nav-link' } to="/iconliblist" key="iconliblist">图标</NavLink>
                    <NavLink className={({isActive}) => isActive ? "head-nav-link head-nav-active" : "head-nav-link"} to="/logoliblist" key="logoliblist">Logo</NavLink>
                    <div className='userInfo'>
                        {
                            // isLogin && userInfo? <span>{userInfo.account}</span> : <Link onClick={openLoginModal} to="">管理</Link>
                            isLogin && user ? <span>{user.account}</span> : <Link onClick={openLoginModal} to="">管理</Link>
                        }
                    </div>
                </div> */}
                <Routes>
                    {
                        routers.map((value, key) => {
                            console.log(value.path);
                            if(value.exact == true) {
                                return <Route exact path={value.path} element={<value.compnent/>} key={key} />
                            } else {
                                return <Route path={value.path} element={<value.compnent/>} key={key} />
                            }
                        })
                    }
                </Routes>
            </Router>
            <Modal 
                open={showLoginModal}
                footer={[]}
            >
                <Login onCancel={onLoginCanceled} onSuccess={onLoginSuccessed}/>
            </Modal>
        </>
    )
}
export default App;