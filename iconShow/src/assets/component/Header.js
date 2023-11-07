import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Exit, ResourcesManagement } from '../component/iconlib/react';
import util from '../../util';
import Config from '../../config';
import { UserContext } from '../../UserContext';
import { Button } from 'antd';

const serviceBasePath = Config.serviceBasePath;

const Header = (props) => {
    const {openLogin} = props;
    const context = useContext(UserContext);
    const {user, login, logout} = context;

    // 退出登录, 更新Context、SessionStorage
    const logoutSys = () => {
        
        fetch(`${serviceBasePath}/logout`, {
            method: "POST",
        })
        .then(response => response.json())
        .then(result => {
            console.debug(result);
            if(result.success === true) {
                logout();
                sessionStorage.removeItem('userInfo');
            }
        });
    }

    useEffect( () => {
        // 验证是否在线
        const userInfo = util.getLocalUserInfo();
        if(userInfo) {
            // 获取在线状态的用户名
            login({userId:userInfo.userId, account: userInfo.account})
        }
    }, [])

    return (
        <div className='header'>
            <div className='logo'></div>
            <div className="head-blank"></div>
            <NavLink className={({ isActive }) => isActive ? 'head-nav-link head-nav-active' : 'head-nav-link'} to="/iconliblist" key="iconliblist">图标</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'head-nav-link head-nav-active' : 'head-nav-link'} to="/naviconliblist" key="naviconliblist">导航图标</NavLink>
            <NavLink className={({isActive}) => isActive ? "head-nav-link head-nav-active" : "head-nav-link"} to="/logoliblist" key="logoliblist">Logo</NavLink>
            <div className='userInfo'>
                {
                    user ? <span onClick={logoutSys}>{user.account}<Exit theme="filled" size={20} fill="#1F64FF"/></span> : <Link onClick={openLogin} to=""><ResourcesManagement theme="filled" size={20} fill="#1F64FF"/></Link>
                }
            </div>
        </div>
    )
}
export default Header;