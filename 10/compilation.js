const fs = require('fs')

function CompilationEngine(tokens, fileName) {
    this.outputPath = fileName + '.xml'
    this.fileName = fileName + '.jack'
    this.tokens = tokens
    this.len = tokens.length
    this.output = ''
    // index
    this.i = -1
    this._compileClass()
}

CompilationEngine.prototype = {
    _compileClass() {
        const tokens = this.tokens
        let key
        let val

        [key, val] = getNextToken()

        if (val === 'class') {
            this.output += '<class>'
            this.output += `<${key}> ${val} </${key}>`

            [key, val] = getNextToken()
            if (key === 'identifier') {
                this.output += `<${key}> ${val} </${key}>`

                [key, val] = getNextToken()
                if (val === '{') {
                    this.output += `<${key}> ${val} </${key}>`

                    while (this.i < this.len) {
                        [key, val] = getNextToken()
                        switch (val) {
                            case 'static':
                            case 'filed':
                                this._compileVarDec()
                                break
                            case 'constructor':
                            case 'function':
                            case 'method':
                                this._compileSubroutine()
                                break
                            default:
                                throw 'expect keyword static | field | constructor | function | method'
                        }
                    }
                    
                    this.output += '</class>'
                    this.createXMLFile()
                } else {
                    error(key, val, '{')
                }
            } else {
                error(key, val, 'identifier')
            }
        } else {
            error(key, val, 'class')
        }
    },

    _compileClassVarDec() {

    },

    _compileSubroutine() {

    },

    _compileParameterList() {

    },

    _compileVarDec() {

    },

    _compileStatements() {

    },

    _compileDo() {

    },

    _compileLet() {

    },

    _compileWhile() {

    },

    _compileIf() {

    },

    _compileReturn() {

    },

    _compileExpression() {

    },

    _compileTerm() {

    },

    _compileExpressionList() {

    },

    createXMLFile() {
        fs.writeFileSync(this.outputPath, this.output)
    },

    getNextToken() {
        this.i++
        let obj = this.tokens[this.i]
        let key = Object.keys(obj)[0]
        let val = obj[key]

        return [key, val]
    },

    error(key, val, type) {
        let error = 'line:' + tokens[this.i].line + ' syntax error:' + key + ': ' + val 
                  + 'Expect the type of key to be' + type + '\r\nat ' + this.fileName
        throw error
    }
}

module.exports = CompilationEngine