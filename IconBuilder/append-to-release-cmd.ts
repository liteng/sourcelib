import appenToRelease from './appendToRelease';
import iconsInfo from './icons/iconlib/react/iconsMap.json';

console.info('更新图表库...开始');
const result = appenToRelease(iconsInfo);
result === true ? console.log('更新图表库成功') : console.error('更新图表库失败');
console.info('更新图表库...结束');