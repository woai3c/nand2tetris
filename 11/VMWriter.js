const fs = require('fs')

function VMWriter(fileName) {
    this.output = ''
    this.outputPath = fileName + '.vm'
}

VMWriter.prototype = {
    writePush(segment, index) {
        this.output += `push ${segment} ${index}\r\n`
    },

    writePop(segment, index) {
        this.output += `pop ${segment} ${index}\r\n`
    },

    writeArithmetic(command) {
        this.output += command + '\r\n'
    },

    writeLabel(label) {
        this.output += `label ${label}\r\n`
    },

    writeGoto(label) {
        this.output += `goto ${label}\r\n`
    },

    writeIf(label) {
        this.output += `if-goto ${label}\r\n`
    },

    writeCall(name, nArgs) {
        this.output += `call ${name} ${nArgs}\r\n`
    },

    writeFunction(name, nArgs) {
        this.output += `function ${name} ${nArgs}\r\n`
    },

    writeReturn() {
        this.output += `return\r\n`
    },

    createVMFile() {
        fs.writeFileSync(this.outputPath, this.output)
    }
}

module.exports = VMWriter