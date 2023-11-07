import gulpTasks from './gulpTask';
import { compilerIcon } from './compilerIcon';
import appenToRelease from './appendToRelease';

console.info('编译图标...开始');
const startArgs = process.argv.splice(2);
console.log('startArgs: ', startArgs);
const libType = startArgs[0];


const iconsInfo = compilerIcon(libType).then( iconsInfo => {
    // console.log(iconsInfo);

    console.info('构建图标库...开始');
    gulpTasks(libType, ()=>{
        console.log('Icon compiler task is finished.')
        console.info('构建图标库...结束');
        console.info('编译图标...结束');
    });
});
