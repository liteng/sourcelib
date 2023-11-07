import IconlibList from '../assets/pages/Iconlib/iconlibList';
import NavIconlibList from '../assets/pages/NavIconlib/navIconlibList';
import LogolibList from '../assets/pages/Logolib/logolibList';

let routers = [
    {
        path: '/',
        compnent: IconlibList
    },
    {
        path: '/iconliblist',
        compnent: IconlibList
    },
    {
        path: '/naviconliblist',
        compnent: NavIconlibList
    },
    {
        path: '/logoliblist',
        compnent: LogolibList
    }
]

export default routers;