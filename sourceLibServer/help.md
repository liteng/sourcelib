# 构建
如果已经拥有证书文件，可以直接构建：
```
npm run build
```
项目将打包至/dist目录下。

如果没有证书，需要先生成证书。

## ssl证书文件生成
命令行中执行：
```
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
-keyout private_key.pem -out ca-cert.pem
```
# 部署
部署目录：
/opt/sourceLibServer

## 停止原服务
查找进程:
```
netstat -ltnp | grep -w ':10000'

// 显示(例)：
tcp6    0   0 :::10000  :::*    LISTEN  23133/node
// 其中23133为进程号
```
停止进程：
```
kill -9 23133
```
## 准备文件
备份并删除原项目文件:
```
cp -r /opt/sourceLibServer /opt/sourceLibServer_bak_yyyymmdd

rm -rf /opt/sourceLibServer
```
解压缩新项目文件至 /opt/sourceLibServer:
```
unzip dist.zip -d sourceLibServer
```

## 运行
本地试运行可以在/dist目录中执行：
```
npm run cmdStart
```
生产环境中，在部署目录中执行：
```
npm start
```