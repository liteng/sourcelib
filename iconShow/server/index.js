const runJsonServer = require("./devJsonserver");
const runWebServer = require("./devWebserver");

// 执行启动命令时, 可以传入参数来决定是否启用JSON Server: node ./server/index.js jsonserver, 此处来获取该参数
const startArgs = process.argv.splice(2);
console.debug(startArgs);
const isJsonserver = startArgs[0] === 'jsonserver' ? true : false;
console.debug(isJsonserver);

// 启动JSON Server
isJsonserver && runJsonServer();
// 启动WEB Server
runWebServer();