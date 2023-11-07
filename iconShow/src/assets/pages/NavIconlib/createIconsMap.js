// import icons from './icons';
import * as Icons from '../../component/iconlib/react';
import * as NavIcons from '../../component/naviconlib/react';

export const createIconsMap = (icons) => {
    const iconsMap = icons.map( item => {
        item.Compnent = Icons[item.CompnentElement];
        return item;
    })
    // console.log(iconsMap);
    return iconsMap;
};

export const createNavIconsMap = (icons) => {
    const iconsMap = icons.map(item => {
        item.Compnent = NavIcons[item.CompnentElement];
        return item;
    })
    // console.log(iconsMap);
    return iconsMap;
};