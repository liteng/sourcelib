import icons from './icons';
import * as Icons from '../../component/iconlib/react';

export const createIconsMap = () => {
    const iconsMap = icons.map( item => {
        item.Compnent = Icons[item.CompnentElement];
        return item;
    })
    // console.log(iconsMap);
    return iconsMap;
};

// Test
export const createIconsSet = (iconsSet) => {
    const iconsmap = iconsSet.map( item => {
        item.Compnent = Icons[item.CompnentElement];
        return item;
    })
    // console.log(iconsMap);
    return iconsmap;
};

// export default creatIconsMap;