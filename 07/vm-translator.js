const fs = require('fs')
const {parser} = require('./parser')

const fileName = process.argv[2]
// 判断是否目录
const isDirectory = fs.lstatSync(fileName).isDirectory()

// 最终要输入文件的字符串
let assembleOut = ''
// 最终输出的文件名
let outputFileName
// 初始化
init()

if (isDirectory) {
    outputFileName = fileName
    fs.readdir(fileName, (err, files) => {
        if (err) {
            throw err
        }
        console.log(files)
        // 循环处理目录中的文件
        files.forEach(file => {
            let tempArry = file.split('.')
            tempArry.pop() 
            let preName = tempArry.join('.')
            let data = fs.readFileSync(`${fileName}/${file}`, 'utf-8')
            processFileData(data, preName)
        })

        setFileName()
    })
} else {
    // 处理类似a.b.c这种格式的文件 保留a.b
    let tempArry = fileName.split('.')
    tempArry.pop() 
    let preName = tempArry.join('.')
    outputFileName = preName
    let data = fs.readFileSync(fileName, 'utf-8')
    processFileData(data, preName)

    setFileName()
}

// 处理文件数据
function processFileData(data, preName) {
    data = data.split('\r\n')
    assembleOut += parser(data, preName)
}

// 必须得初始化一些必要段的基地址 测试脚本的初始化不全 不自己初始化 测试脚本过不了
// 有些地址是临时起的 具体怎么设还得把下一章学完
function init() {
    assembleOut = '@256\r\n' // SP
                + 'D=A\r\n'
                + '@SP\r\n' 
                + 'M=D\r\n'
                + '@300\r\n' // local
                + 'D=A\r\n'
                + '@LOCAL\r\n' 
                + 'M=D\r\n'
                + '@400\r\n' // argument
                + 'D=A\r\n'
                + '@ARGUMENT\r\n'  
                + 'M=D\r\n'
                + '@3000\r\n' // this
                + 'D=A\r\n'
                + '@THIS\r\n' 
                + 'M=D\r\n'
                + '@3010\r\n' // that
                + 'D=A\r\n'
                + '@THAT\r\n' 
                + 'M=D\r\n'
                + '@5\r\n' // temp
                + 'D=A\r\n'
                + '@TEMP\r\n' 
                + 'M=D\r\n'
                + '@3\r\n' // pointer
                + 'D=A\r\n'
                + '@POINTER\r\n' 
                + 'M=D\r\n'

}   

// 输出文件
function setFileName() {
    fs.writeFile(outputFileName + '.asm', assembleOut, (err) => {
        if (err) {
            throw err
        }
    })
}