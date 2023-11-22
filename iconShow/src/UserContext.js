import React, { createContext, useState } from "react";
import util from "./util";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const localUserInfo = util.getLocalUserInfo();
    // console.debug('UserProvider localUserInfo: ', localUserInfo);
    const [user, setUser] = useState(
        localUserInfo ? 
        {
            userId: localUserInfo.userId, 
            account: localUserInfo.account, 
            token: localUserInfo.token
        } :
        null
    );
    const login = (userInfo) => {
        // console.debug('--UserContext login');
        // const newUserInfo = { ...userInfo };
        // 写入浏览器
        util.setLocalUserInfo(userInfo);
        setUser(userInfo);
    }
    const logout = () => {
        // console.debug('--UserContext logout')
        // 写浏览器(清空用户信息)
        util.removeLocalUserInfo();
        setUser(null);
    }
    const value = {user, login, logout};
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}