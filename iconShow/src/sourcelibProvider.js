import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { HashRouter as Router, Route, Link, NavLink, Routes } from 'react-router-dom';
import { UserProvider } from './UserContext';
import App from './app';

const SourcelibProvider = () => {

    return (
        <UserProvider>
            <App/>
        </UserProvider>
    )
}
export default SourcelibProvider;