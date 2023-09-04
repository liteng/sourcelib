# ssl证书文件生成
命令行中执行：
```
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
-keyout private_key.pem -out ca-cert.pem
```

