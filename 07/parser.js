const types = {

}

let command
function parser(commands) {
    while (hasMoreCommands(commands)) {
        command = commands.shift().trim()
        if (isValidCommand(command)) {
            advance(command)
        }
    }
}

// 匹配指令中的注释
const reg1 = /(\/\/).+/
let type
function advance(command) {
    command = command.replace(reg1, '').trim()
    type = commandType(command)

    switch (type) {
        case 'push':

            break
        case 'pop':

            break
        case 'arith':

            break
    }
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

function arg1(command, type) {
    if (type == 'arith') {
        return command
    } else {
        const tempArry = command.split(' ').slice(1)
        let arg = tempArry.shift()
        while (temp === '') {
            temp = tempArry.shift()
        }

        return arg
    }
}

let arg2Arry = ['push', 'pop', 'function', 'call']

function arg2(command, type) {
    if (arg2Arry.includes(type)) {
        
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

module.exports = parser