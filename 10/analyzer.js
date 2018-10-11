const fs = require('fs')
const JackTokenizer = require('./tokenizer.js')
const CompilationEngine = require('./compilation.js')

const fileName = process.argv[2]


// 判断是否目录
const isDirectory = fs.lstatSync(fileName).isDirectory()

if (isDirectory) {
    fs.readdir(fileName, (err, files) => {
        if (err) {
            throw err
        }

        // 循环处理目录中的文件
        files.forEach(file => {
            let tempArry = file.split('.')
            if (tempArry.pop() == 'jack') {
                let preName = tempArry.join('.')
                let data = fs.readFileSync(`${fileName}/${file}`, 'utf-8')
                
                processFileData(data, `${fileName}/${preName}`)
            } 
        })
    })
} else {
    // 处理类似a.b.c这种格式的文件 保留a.b
    let tempArry = fileName.split('.')
    if (tempArry.pop() == 'jack') {
        let preName = tempArry.join('.')
        let data = fs.readFileSync(fileName, 'utf-8')
        processFileData(data, preName)
    }
}

// 处理文件数据
function processFileData(data, path) {
    data = data.split(/\r\n|\n/)
    const tokens = new JackTokenizer(data, path).getTokens()
    new CompilationEngine(tokens, path)
}  

// 输出文件
function setFileName(name, data) {
    fs.writeFile(name + '.vm', data, (err) => {
        if (err) {
            throw err
        }
    })
}