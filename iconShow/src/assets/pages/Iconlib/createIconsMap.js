import icons from './icons';
import * as Icons from '../../component/iconlib/react';

const creatIconsMap = () => {
    const iconsMap = icons.map( item => {
        item.Compnent = Icons[item.CompnentElement];
        return item;
    })
    // console.log(iconsMap);
    return iconsMap;
};

export default creatIconsMap;