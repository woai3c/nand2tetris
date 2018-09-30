const table = require('./symbol-table')
const fs = require('fs')
const parser = require('./parser')

let fileName = process.argv[2]

fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) {
        throw err
    }
    // 每行指令
    data = data.split('\r\n')

    // 首次解析收集符号
    parser([...data], true)

    // 真正的解析指令
    const binaryOut = parser(data)

    fileName = fileName.split('.')[0]

    fs.writeFile(fileName + '.hack', binaryOut, (err) => {
        if (err) {
            throw err
        }
    })
})
