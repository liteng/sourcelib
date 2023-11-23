# 构建
修改配置文件 /src/config.js，将url改为生产环境地址，如下：
```
const config = {
    // 本地开发
    // serviceBasePath: "https://localhost:10000",
    // sourceBasePath: "https://localhost:10000",
    // 生产环境
    serviceBasePath: "https://192.168.187.233:10000",
    sourceBasePath: "https://192.168.187.233:10000"
}

export default config;
```
如果 /public/downloads 目录下未提供最新的组件包介质，将 /src/assets/component/iconlib、/src/assets/component/naviconlib 分别压缩为 iconlib.zip、naviconlib.zip，移至 /public/downloads下。

执行构建：
```
npm run build
```
项目将打包至/dist目录下。

# 部署
部署环境：Windows server、Nginx
部署目录：
D:\web\www\html\app

## 准备文件
备份项目文件至 D:\web\www\html\app\bakup_yyyymmdd。

删除原项目文件。

解压缩 dist.zip 至 D:\web\www\html\app。

## 停止&运行
停止或启动 Nginx 即可。