## 解决在 windows 下无法打开 `JackCompiler.bat` 工具的问题

首先建立一个文件，命名为 `jc.cmd`，输入：
```
@echo off
pushd .
call F:\nand2tetris\tools\JackCompiler.bat %cd%\%1
popd
```
保存，将 `jc.cmd` 拖到你要执行命令的目录里。假设当前路径下有一个 `test` 目录或 `test.jack` 文件。在当前目录打开命令行，输入：
```
jc test
```
即可编译成功。如果你是 win10 系统：
```
.\jc.cmd test
```

**注意：** `F:\nand2tetris\tools\JackCompiler.bat` 这个是工具的路径，你需要将它替换成自己工具的路径。另外，**不要使用中文路径**，否则执行报错。

