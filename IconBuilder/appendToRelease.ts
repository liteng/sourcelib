import fs from 'fs';
import path from 'path';
import { IIconProps } from './preprocess';
import del from 'del';
import { copyFolder, deleteFiles } from './utils/fsUtil';
import iconsMap from './release/iconlib/react/iconsMap.json';

const appenToRelease = (newIcons: IIconProps[]): boolean => {
    console.debug('++appenToRelease begain');
    // 排重校验
    const result = newIcons.filter( newIcon => iconsMap.some( oldIcon => newIcon.name == oldIcon.name));
    if(result.length > 0) {
        console.log('冲突! 共有重复图标: ', result.length);
        result.forEach( icon => {
             console.log('重复图标: ', icon.name);
        })
        return false;
    }

    // 将 Icons/iconlib/react/es/index.js 里的内容追加加至 release/iconlib/react/es/index.js
    const srcIndexPath = path.resolve(__dirname, 'Icons/iconlib/react/es/index.js');
    const tgtIndexPath = path.resolve(__dirname, 'release/iconlib/react/es/index.js');
    const srcIndexContent = '\n' + fs.readFileSync(srcIndexPath, {encoding: 'utf8'});
    console.log(srcIndexContent);
    fs.appendFileSync(tgtIndexPath, srcIndexContent, {encoding: 'utf8'});

    // 将 Icons/iconlib/react/es/index.d.ts 里的内容追加加至 release/iconlib/react/es/index.d.ts
    const srcIndexDtsPath = path.resolve(__dirname, 'Icons/iconlib/react/es/index.d.ts');
    const tgtIndexDtsPath = path.resolve(__dirname, 'release/iconlib/react/es/index.d.ts');
    const srcIndexDtsContent = fs.readFileSync(srcIndexDtsPath, {encoding: 'utf8'});
    console.log(srcIndexDtsContent);
    fs.appendFileSync(tgtIndexDtsPath, srcIndexDtsContent, {encoding: 'utf8'});

    // 复制Icons/iconlib/react/es/icons/* -> release/iconlib/react/es/icons
    const srcIcons = path.resolve(__dirname, 'Icons/iconlib/react/es/icons');
    const tgtIcons = path.resolve(__dirname, 'release/iconlib/react/es/icons');
    const copyResult = copyFolder(srcIcons, tgtIcons, {isCover: true});
    if(copyResult === true) {
        console.log('复制icon文件完成');
    } else {
        console.log('复制icon文件失败');
        return false;
    }

    // 更新iconsMap.json
    const tgtIconsMapPath = path.resolve(__dirname, 'release/iconlib/react/iconsMap.json');
    const newIconsMap = iconsMap.concat(newIcons);
    const newIconsMapContent = JSON.stringify(newIconsMap, null, 4);
    console.log(srcIndexContent);
    fs.writeFileSync(tgtIconsMapPath, newIconsMapContent, {encoding: 'utf8'});

    // 清理编译文件
    del([
        path.resolve(__dirname, 'Icons/svg/**/*'), 
        path.resolve(__dirname, 'Icons/iconlib/react/es/icons'),
        path.resolve(__dirname, 'Icons/iconlib/react/iconsMap.json'),
        path.resolve(__dirname, 'Icons/iconlib/react/es/index.js'),
        path.resolve(__dirname, 'Icons/iconlib/react/es/index.d.ts')
    ]);
    console.debug('++appenToRelease end');
    return true;
}

export default appenToRelease;