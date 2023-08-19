import React, { createContext, useState } from "react";
import util from "./util";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const localUserInfo = util.getLocalUserInfo();
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
        const newUserInfo = {...userInfo};
        setUser(newUserInfo);
    }
    const logout = () => {
        setUser(null);
    }
    const value = {user, login, logout};
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}