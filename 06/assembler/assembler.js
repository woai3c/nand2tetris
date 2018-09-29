import {constructor, ramAddress, table} from './symbol-table.js'
import parser from 'parser.js'

const fileName = process.argv[2]

fs.readFile(fileName, (err, data) => {
    if (err) {
        throw err
    }
    data = data.split('/n')
    // 初始化符号表
    constructor()
    parser(data)
})
