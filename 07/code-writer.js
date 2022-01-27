// 存放生成的symbol
const symbols = []

const types = ['add', 'sub', 'neg', 'eq', 'gt', 'lt', 'and', 'or', 'not']
let index = 0
function writeArithmetic(command) {
    if (types.includes(command)) {
        let output

        let output1 = '@SP\r\n'
                    + 'AM=M-1\r\n'
                    + 'D=M\r\n'
                    + 'A=A-1\r\n'

        let output2 = '@SP\r\n'
                    + 'AM=M-1\r\n'

        let output3 = '@SP\r\n'
                    + 'M=M+1\r\n'

        switch (command) {
            case 'add':
                output = output1 + 'M=M+D\r\n'
                break
            case 'sub':
                output = output1 + 'M=M-D\r\n'
                break
            case 'neg':
                output = output2 + 'M=-M\r\n' + output3
                break
            case 'eq':
                output = createJudgementString('JEQ', index++)
                break
            case 'gt':
                output = createJudgementString('JGT', index++)
                break
            case 'lt':
                output = createJudgementString('JLT', index++)
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


function createJudgementString(judge, index) {
    // 先将两个数相减 再根据给出条件 大于 等于 小于 来处理
    // 因为判断大小需要用到跳转 所以得随机产生两个不同的symbol作标签
    let str = '@SP\r\n'
            + 'AM=M-1\r\n'
            + 'D=M\r\n'
            + 'A=A-1\r\n'
            + 'D=M-D\r\n'
            + '@TRUE' + index + '\r\n' // 如果符合条件判断 则跳转到symbol1标记的地址
            + 'D;' + judge + '\r\n' // 否则接着往下处理
            + '@SP\r\n'
            + 'AM=M-1\r\n'
            + 'M=0\r\n' // 没跳转，说明结果为 false(0，即二进制全为 0)
            + '@SP\r\n'
            + 'M=M+1\r\n'
            + '@CONTINUE' + index + '\r\n'
            + '0;JMP\r\n'
            + '(TRUE' + index + ')\r\n'
            + '@SP\r\n'
            + 'AM=M-1\r\n'
            + 'M=-1\r\n' // 已跳转，说明结果为 true(-1，即二进制全为 1)
            + '@SP\r\n'
            + 'M=M+1\r\n'
            + '(CONTINUE' + index + ')\r\n'
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
                        + 'AM=M-1\r\n'
                        + 'D=M\r\n'
                        + '@' + fileName + '.' + v2 + '\r\n'
                        + 'M=D\r\n'
            }
            break
        case 'POINTER':
            if (v2 == 0) {
                v1 = 'THIS'
            } else if (v2 == 1) {
                v1 = 'THAT'
            }

            if (type == 'push') {
                output = '@' + v1 + '\r\n'  
                        + 'D=M\r\n'
                        + '@SP\r\n'
                        + 'A=M\r\n'
                        + 'M=D\r\n'
                        + '@SP\r\n'
                        + 'M=M+1\r\n'
            } else {
                output = '@' + v1 + '\r\n'  
                        + 'D=A\r\n'
                        + '@R13\r\n'
                        + 'M=D\r\n'
                        + '@SP\r\n'
                        + 'AM=M-1\r\n'
                        + 'D=M\r\n'
                        + '@R13\r\n'
                        + 'A=M\r\n'
                        + 'M=D\r\n'
            }
            break
        case 'TEMP':
            if (type == 'push') {
                output = pushTemplate('@R5\r\n', v2, false)
            } else {
                output = popTemplate('@R5\r\n', v2, false)
            }

            break
        default:
            let str
            if (v1 == 'LOCAL') {
                str = '@LCL\r\n'  
            } else if (v1 == 'ARGUMENT') {
                str = '@ARG\r\n'  
            } else {
                str = '@' + v1 + '\r\n'  
            }
            
            if (type == 'push') {
                output = pushTemplate(str, v2, true)
            } else {
                output = popTemplate(str, v2, true)
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

function popTemplate(str, v2, flag) {
    let str1 = flag? 'D=M\r\n' : 'D=A\r\n'
    let output = str
                + str1
                + '@' + v2 + '\r\n'
                + 'D=D+A\r\n'
                + '@R13\r\n'
                + 'M=D\r\n'
                + '@SP\r\n'
                + 'AM=M-1\r\n'
                + 'D=M\r\n'
                + '@R13\r\n'
                + 'A=M\r\n'
                + 'M=D\r\n'

    return output
}

function pushTemplate(str, v2, flag) {
    let str1 = flag? 'D=M\r\n' : 'D=A\r\n'
    let output = str  
                + str1
                + '@' + v2 + '\r\n'
                + 'A=D+A\r\n'
                + 'D=M\r\n'
                + '@SP\r\n'
                + 'A=M\r\n'
                + 'M=D\r\n'
                + '@SP\r\n'
                + 'M=M+1\r\n'

    return output
}

module.exports = {
    writePushPop,
    writeArithmetic
}