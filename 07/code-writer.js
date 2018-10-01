const {arg1, arg2} = require('./parser') 

function setFileName() {

}

const types = ['add', 'sub', 'neq', 'eq', 'gt', 'lt', 'and', 'or', 'not']
function writeArithmetic(command) {
    if (types.includes(command)) {
        let output

        let output1 = `
                    @SP\r\n
                    M=M-1\r\n
                    A=M\r\n
                    D=M\r\n
                    A=A-1\r\n
                    `
        let output2 = `
                    @SP\r\n
                    M=M-1\r\n
                    A=M\r\n
                    `
        let output3 = `
                    @SP\r\n
                    M=M+1\r\n
                    `
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
                output = output1 + `
                                D=M-D\r\n
                                @EQ\r\n
                                D;JEQ\r\n
                                @NEQ\r\n
                                0;JMP\r\n
                                (EQ)\r\n
                                @SP\r\n
                                M=M-1\r\n
                                A=M\r\n
                                M=-1\r\n
                                @SP\r\n
                                M=M+1\r\n
                                (NEQ)\r\n
                                @SP\r\n
                                M=M-1\r\n
                                A=M\r\n
                                M=0\r\n
                                @SP\r\n
                                M=M+1\r\n
                                `
                break
            case 'gt':
                
                break
            case 'lt':
                
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
    }
}

function writePushPop(command, type) {
    let v1 = toUpper(arg1(command, type)) 
    let v2 = arg2(command, type)
    let output 

    if (type == 'push') {
        output = `
                @${v1}\r\n  
                D=M\r\n
                @${v2}\r\n
                A=D+A\r\n
                D=M\r\n
                @SP\r\n
                A=M\r\n
                M=D\r\n
                @SP\r\n
                M=M+1\r\n
                 `      
    } else {
        output = `
                @SP\r\n
                M=M-1\r\n
                A=M\r\n
                D=M\r\n
                @R5\r\n
                M=D\r\n
                @${v1}\r\n  
                D=M\r\n
                @${v2}\r\n
                A=D+A\r\n
                D=A\r\n
                @R6\r\n
                M=D\r\n
                @R5\r\n
                D=M\r\n
                @R6\r\n
                A=M\r\n
                M=D\r\n
                `
    }
}

function close() {
    
}

function toUpper(arg) {
    return arg.toLocaleUpperCase()
}