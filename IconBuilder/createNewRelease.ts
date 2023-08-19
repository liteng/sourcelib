import fs from 'fs';
import path from 'path';
import { IIconProps } from './preprocess';
import del from 'del';
import { copyFolder } from './utils/fsUtil';

const createNewRelease = () => {
    console.debug('++createNewRelease begain');

    del([
        path.resolve(__dirname, './newRelease/**/*')
    ]).then( () => {
        fs.mkdirSync(path.resolve(__dirname, './newRelease/iconlib'));
        fs.mkdirSync(path.resolve(__dirname, './newRelease/iconlib/react'));

        const esDir = path.resolve(__dirname, './Icons/iconlib/react/es');
        const tgtEsDir = path.resolve(__dirname, './newRelease/iconlib/react/es');
        const stylesDir = path.resolve(__dirname, './Icons/iconlib/react/styles');
        const tgtStylesDir = path.resolve(__dirname, './newRelease/iconlib/react/styles');
        const packageFile = path.resolve(__dirname, './Icons/iconlib/react/package.json');
        const tgtPackageFile = path.resolve(__dirname, './newRelease/iconlib/react/package.json');
        const iconsMapFile = path.resolve(__dirname, './Icons/iconlib/react/iconsMap.json');
        const tgtIconsMapFile = path.resolve(__dirname, './newRelease/iconlib/react/iconsMap.json');

        copyFolder(esDir, tgtEsDir, {isCover: true, isMakeDir: true});
        copyFolder(stylesDir, tgtStylesDir, {isCover: true, isMakeDir: true});
        fs.copyFileSync(packageFile, tgtPackageFile);
        fs.copyFileSync(iconsMapFile, tgtIconsMapFile);

        // 清理编译文件
        del([
            // path.resolve(__dirname, 'Icons/svg/**/*'), 
            path.resolve(__dirname, 'Icons/iconlib')
            // path.resolve(__dirname, 'Icons/iconlib/react/es/icons'),
            // path.resolve(__dirname, 'Icons/iconlib/react/iconsMap.json'),
            // path.resolve(__dirname, 'Icons/iconlib/react/es/index.js'),
            // path.resolve(__dirname, 'Icons/iconlib/react/es/index.d.ts')
        ]);
        console.debug('++createNewRelease end');
    });
}

export default createNewRelease;