使用方法
需要先下载nodejs
```
// 处理单个文件
node vm-translator.js xxx.vm
// 处理目录
node vm-translator.js xxx
```
将会生成一个与vm文件或目录同名的asm文件

注意换行符的不同
如果换行符为 lf 要换为 crlf
