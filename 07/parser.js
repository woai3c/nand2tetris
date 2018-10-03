const {writeArithmetic, writePushPop} = require('./code-writer')

function parser(commands, fileName) {
    let output = ''
    while (hasMoreCommands(commands)) {
        // 逐条弹出命令 再处理
        let command = commands.shift().trim()
        // 如果命令有效
        if (isValidCommand(command)) {
            output += advance(command, fileName)
        }
    }

    return output
}

// 匹配指令中的注释
const reg1 = /(\/\/).+/

function advance(command, fileName) {
    let output
    command = command.replace(reg1, '').trim()
    let type = commandType(command)

    switch (type) {
        case 'push':
        case 'pop':
            output = writePushPop(command, type, fileName)
            break
        case 'arith':
            output = writeArithmetic(command)
            break
    }

    return output
}

function hasMoreCommands(commands) {
    return commands.length > 0? true : false
}

const rePush = /^(push)/
const rePop = /^(pop)/

function commandType(command) {
    if (rePush.test(command)) {
        return 'push'
    } else if (rePop.test(command)) {
        return 'pop'
    } else {
        return 'arith'
    }
}

// 匹配以注释开关的句子
const reg2 = /^(\/\/)/

function isValidCommand(command) {
    if (command === '' || reg2.test(command)) {
        return false
    } 
    return true
}

module.exports = {
    parser
}