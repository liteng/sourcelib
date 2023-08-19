import path from 'path';
import fs from 'fs';

// 删除目录
export const deleteFolder = (folderPath: string) => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file, index) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { 
                // 递归
                deleteFolder(curPath);
            } else {
                // 删除文件
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

// 删除多个目录
export const deleteFiles = (folderPathes: string[]) => {
    folderPathes.forEach( curPath => {
        console.log('delete: ', curPath);
        if (fs.lstatSync(curPath).isDirectory()) {
            console.log('- 目录')
            // 递归删除目录
            deleteFolder(curPath);
        } else {
            console.log('- 文件')
            // 删除文件
            fs.unlinkSync(curPath);
        }
    })
}

type CopyFolderOption = {
    isCover?: boolean;
    isMakeDir?: boolean;
}
// 复制目录中的内容至另一目录
export const copyFolder = (src: string, dest: string, option: CopyFolderOption = {isCover: true, isMakeDir: true}): boolean => {
    const {isCover, isMakeDir} = option;

    if (!fs.existsSync(src)) {
        console.error(`源目录: ${src} 不存在`);
        return false;
    }
    if (!fs.existsSync(dest)) {
        if(isMakeDir === true) {
            fs.mkdirSync(dest);
            console.log('新建目录: ', dest);
        } else {
            console.error(`目标目录: ${dest} 不存在`);
            return false;
        }
    }

    let files = fs.readdirSync(src);
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let srcPath = path.join(src, file);
        let destPath = path.join(dest, file);
        let stats = fs.statSync(srcPath);
        if (stats.isFile()) {
            if( fs.existsSync(destPath) ) {
                if( isCover ) {
                    fs.copyFileSync(srcPath, destPath);
                } else {
                    return false;
                }
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        } else if (stats.isDirectory()) {
            if( fs.existsSync(destPath) ) {
                if( isCover ) {
                    copyFolder(srcPath, destPath, {isCover: isCover, isMakeDir: isMakeDir});
                } else {
                    return false;
                }
            } else {
                copyFolder(srcPath, destPath, {isCover: isCover, isMakeDir: isMakeDir});
            }
        }
    }

    return true;
}