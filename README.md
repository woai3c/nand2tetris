# 计算机系统要素-从零开始构建现代计算机-练习题答案
### [全套工具](https://github.com/woai3c/teocs-exercises/blob/master/nand2tetris.zip)

### 代码生成器
由于多位门代码重复太多次 所以用JS写了一个HDL代码生成器 方便产生HDL代码
示例：
```
                      门  位数 输出名 输入名 输入名
node codeGenerator.js And 16 out a b

输出
	And(a = a[0], b = b[0], out = out[0]);
	And(a = a[1], b = b[1], out = out[1]);
	And(a = a[2], b = b[2], out = out[2]);
	And(a = a[3], b = b[3], out = out[3]);
	And(a = a[4], b = b[4], out = out[4]);
	And(a = a[5], b = b[5], out = out[5]);
	And(a = a[6], b = b[6], out = out[6]);
	And(a = a[7], b = b[7], out = out[7]);
	And(a = a[8], b = b[8], out = out[8]);
	And(a = a[9], b = b[9], out = out[9]);
	And(a = a[10], b = b[10], out = out[10]);
	And(a = a[11], b = b[11], out = out[11]);
	And(a = a[12], b = b[12], out = out[12]);
	And(a = a[13], b = b[13], out = out[13]);
	And(a = a[14], b = b[14], out = out[14]);
	And(a = a[15], b = b[15], out = out[15]);
```


```
                      门  位数 输出名 输入名
node codeGenerator.js Not 16 out in

输出
    Not(in = in[0], out = out[0]);
    Not(in = in[1], out = out[1]);
    Not(in = in[2], out = out[2]);
    Not(in = in[3], out = out[3]);
    Not(in = in[4], out = out[4]);
    Not(in = in[5], out = out[5]);
    Not(in = in[6], out = out[6]);
    Not(in = in[7], out = out[7]);
    Not(in = in[8], out = out[8]);
    Not(in = in[9], out = out[9]);
    Not(in = in[10], out = out[10]);
    Not(in = in[11], out = out[11]);
    Not(in = in[12], out = out[12]);
    Not(in = in[13], out = out[13]);
    Not(in = in[14], out = out[14]);
    Not(in = in[15], out = out[15]);
```

然后将代码复制到对应的HDL文件就可以了
