const table = require('./symbol-table')
const {addEntry, contains, getAddress} = table
let {ramAddress} = table
const code = require('./code')
const {dest, comp, jump} = code

// 程序计数器 每遇到A或C指令+1
let pc = -1

function parser(instructions, isFirst) {
    return advance(instructions, isFirst)
}

function hasMoreCommands(instructions) {
    return instructions.length > 0? true : false
}

// 匹配指令中的注释
const reg3 = /(\/\/).+/
function advance(instructions, isFirst) {
    let current, type, binaryOut = ''
    while (hasMoreCommands(instructions)) {
        current = instructions.shift().trim()

        if (isInstructionInvalid(current)) {
            continue
        }
        //  如果指令右边有注释 则删除
        current = current.replace(reg3, '').trim()
        type = commandType(current)

        // isFirst 首次解析不会解析指令 只会收集符号 格式:(xxx)
        switch (type) {
            case 'C':
                if (!isFirst) {
                    let d = dest(current)
                    let c = comp(current)
                    let j = jump(current)
                    binaryOut += '111' + c + d + j + '\r\n'
                } else {
                    pc++
                }
                
                break
            case 'A':
                if (!isFirst) {
                    let token = symbol(current, type)
                    let binary
                    if (isNaN(parseInt(token))) {
                        if (contains(token)) {
                            binary = int2Binary(getAddress(token))
                        } else {
                            binary = int2Binary(ramAddress)
                            addEntry(token, ramAddress++)
                        }
                    } else {
                        binary = int2Binary(token)
                    }
                    binaryOut += binary + '\r\n'
                } else {
                    pc++
                }
                
                break
            case 'L':
                if (isFirst) {
                    let token = symbol(current, type)
                    addEntry(token, pc + 1)
                }
                break
        }
    }

    return binaryOut
}
// 返回指令类型
function commandType(instruction) {
    if (instruction.charAt(0) === '@') {
        return 'A'
    } else if (instruction.charAt(0) === '(') {
        return 'L'
    } else {
        return 'C'
    }
}
// 提取@xxx 或 (xxx) 中的xxx
const reg1 = /^\((.+)\)$/
function symbol(instruction, type) {
    if (type === 'A') {
        return instruction.substr(1)
    } else if (type === 'L') {
        return instruction.replace(reg1, '$1')
    }
}
// 将十进制数转为二进制指令
function int2Binary(num) {
    let str = parseInt(num).toString(2)

    while (str.length !== 16) {
        str = '0' + str
    }

    return str
}
// 匹配以注释开头的句子
const reg2 = /^(\/\/)/
// 指令是否有效
function isInstructionInvalid(instruction) {
    if (instruction == '' || reg2.test(instruction)) {
        return true
    }

    return false
}

module.exports = parser