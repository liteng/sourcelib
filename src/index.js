import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter as Router, Route, Link, NavLink, Routes } from 'react-router-dom';
import {Button} from 'antd';
import routers from './router/routers';
import * as Icons from './assets/component/iconlib/react';
import iconsMap from './assets/pages/Iconlib/iconsMap';
import 'antd/dist/reset.css';
import './style/index.less';


ReactDom.render(
    <Router>
        <div className='header'>
            <div className='logo'></div>
            <div className="head-blank"></div>
            <NavLink className={({isActive}) => isActive ? 'head-nav-link head-nav-active' : 'head-nav-link' } to="/iconliblist" key="iconliblist">图标</NavLink>
            <NavLink className={({isActive}) => isActive ? "head-nav-link head-nav-active" : "head-nav-link"} to="/logoliblist" key="logoliblist">Logo</NavLink>
        </div>
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
    </Router>,
    document.getElementById('xxx')
)
