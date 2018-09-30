const {arg1, arg2} = require('./parser') 

function setFileName() {

}

function writeArithmetic(command) {

}

function writePushPop(command, type) {
    let v1 = arg1(command, type) 
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