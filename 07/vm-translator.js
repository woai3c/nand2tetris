const fs = require('fs')
const {parser} = require('./parser')

const fileName = process.argv[2]
// 判断是否目录
const isDirectory = fs.lstatSync(fileName).isDirectory()

// 最终要输入文件的字符串
let assembleOut = ''
// 最终输出的文件名
let outputFileName


if (isDirectory) {
    outputFileName = fileName
    fs.readdir(fileName, (err, files) => {
        if (err) {
            throw err
        }

        // 循环处理目录中的文件
        files.forEach(file => {
            let tempArry = file.split('.')
            if (tempArry.pop() == 'vm') {
                let preName = tempArry.join('.')
                let data = fs.readFileSync(`${fileName}/${file}`, 'utf-8')
                processFileData(data, preName)
            } 
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

// 输出文件
function setFileName() {
    fs.writeFile(outputFileName + '.asm', assembleOut, (err) => {
        if (err) {
            throw err
        }
    })
}