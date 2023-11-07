import createNewRelease from './createNewRelease';

console.info('构建新图标库...开始');

const startArgs = process.argv.splice(2);
console.log('startArgs: ', startArgs);
const libType = startArgs[0];

createNewRelease(libType);
console.info('构建新图标库...结束');