import gulpTasks from './gulpTask';
import { compilerIcon } from './compilerIcon';
import appenToRelease from './appendToRelease';

console.info('编译图标...开始');

const iconsInfo = compilerIcon().then( iconsInfo => {
    // console.log(iconsInfo);

    console.info('构建图标库...开始');
    gulpTasks(()=>{
        console.log('Icon compiler task is finished.')
        console.info('构建图标库...结束');
        console.info('编译图标...结束');
    });
});
