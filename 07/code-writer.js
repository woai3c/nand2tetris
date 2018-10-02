// 存放生成的symbol
const symbols = []

const types = ['add', 'sub', 'neq', 'eq', 'gt', 'lt', 'and', 'or', 'not']
function writeArithmetic(command) {
    if (types.includes(command)) {
        let output

        let output1 = '@SP\r\n'
                    + 'M=M-1\r\n'
                    + 'A=M\r\n'
                    + 'D=M\r\n'
                    + 'A=A-1\r\n'

        let output2 = '@SP\r\n'
                    + 'M=M-1\r\n'
                    + 'A=M\r\n'

        let output3 = '@SP\r\n'
                    + 'M=M+1\r\n'

        switch (command) {
            case 'add':
                output = output1 + 'M=M+D\r\n'
                break
            case 'sub':
                output = output1 + 'M=M-D\r\n'
                break
            case 'neq':
                output = output2 + 'M=-M\r\n' + output3
                break
            case 'eq':
                output = createJudgementString('JEQ')
                break
            case 'gt':
                output = createJudgementString('JGT')
                break
            case 'lt':
                output = createJudgementString('JLT')
                break
            case 'and':
                output = output1 + 'M=M&D\r\n'
                break
            case 'or':
                output = output1 + 'M=M|D\r\n'
                break
            case 'not':
                output = output2 + 'M=!M\r\n' + output3
                break
        }

        return output
    }
}

function writePushPop(command, type, fileName) {
    let v1 = arg1(command, type).toUpperCase()
    let v2 = arg2(command, type)

    return processSegment(v1, v2, type, fileName)
}

function createRandomSymbol() {
    let randomNumber = Math.ceil(Math.random()*26)
    let symbol
    let time = 10
    while (true) {
        symbol = ''
        while (time--) {
            symbol += String.fromCharCode(64 + randomNumber)
        }
        if (!symbols.includes(symbol)) {
            symbols.push(symbol)
            break
        }
    }
    return symbol
}

function createJudgementString(judge) {
    let symbol1 = createRandomSymbol()
    let symbol2 = createRandomSymbol()

    let str = '@SP\r\n'
            + 'M=M-1\r\n'
            + 'A=M\r\n'
            + 'D=M\r\n'
            + 'A=A-1\r\n'
            + 'D=M-D\r\n'
            + '@' + symbol1 + '\r\n'
            + 'D;' + judge + '\r\n'
            + '@SP\r\n'
            + 'M=M-1\r\n'
            + 'A=M\r\n'
            + 'M=0\r\n'
            + '@SP\r\n'
            + 'M=M+1\r\n'
            + '@' + symbol2 + '\r\n'
            + '0;JMP\r\n'
            + '(' + symbol1 + ')\r\n'
            + '@SP\r\n'
            + 'M=M-1\r\n'
            + 'A=M\r\n'
            + 'M=-1\r\n'
            + '@SP\r\n'
            + 'M=M+1\r\n'
            + '(' + symbol2 + ')\r\n'
    return str
}

function processSegment(v1, v2, type, fileName) {
    let output
    switch (v1) {
        case 'CONSTANT':
            output = '@' + v2 + '\r\n'
                    + 'D=A\r\n'
                    + '@SP\r\n'
                    + 'A=M\r\n'
                    + 'M=D\r\n'
                    + '@SP\r\n'
                    + 'M=M+1\r\n'
            break
        case 'STATIC':
            if (type == 'push') {
                output = '@' + fileName + '.' + v2 + '\r\n'
                        + 'D=M\r\n'
                        + '@SP\r\n'
                        + 'A=M\r\n'
                        + 'M=D\r\n'
                        + '@SP\r\n'
                        + 'M=M+1\r\n'
            } else {
                output = '@SP\r\n'
                        + 'M=M-1\r\n'
                        + 'A=M\r\n'
                        + 'D=M\r\n'
                        + '@' + fileName + '.' + v2 + '\r\n'
                        + 'M=D\r\n'
            }
            break
        default:
            if (type == 'push') {
                output = '@' + v1 + '\r\n'  
                        + 'D=M\r\n'
                        + '@' + v2 + '\r\n'
                        + 'A=D+A\r\n'
                        + 'D=M\r\n'
                        + '@SP\r\n'
                        + 'A=M\r\n'
                        + 'M=D\r\n'
                        + '@SP\r\n'
                        + 'M=M+1\r\n'
            } else {
                output = '@SP\r\n'
                        + 'M=M-1\r\n'
                        + 'A=M\r\n'
                        + 'D=M\r\n'
                        + '@R5\r\n'
                        + 'M=D\r\n'
                        + '@' + v1 + '\r\n'
                        + 'D=M\r\n'
                        + '@' + v2 + '\r\n'
                        + 'A=D+A\r\n'
                        + 'D=A\r\n'
                        + '@R6\r\n'
                        + 'M=D\r\n'
                        + '@R5\r\n'
                        + 'D=M\r\n'
                        + '@R6\r\n'
                        + 'A=M\r\n'
                        + 'M=D\r\n'
            }
    }

    return output
}


function arg1(command, type) {
    if (type == 'arith') {
        return command
    } else {
        const tempArry = command.split(' ').slice(1)
        let arg = tempArry.shift()
        while (arg === '') {
            arg = tempArry.shift()
        }

        return arg
    }
}

let arg2Arry = ['push', 'pop', 'function', 'call']

function arg2(command, type) {
    if (arg2Arry.includes(type)) {
        return command.split(' ').pop()
    }
}
module.exports = {
    writePushPop,
    writeArithmetic
}