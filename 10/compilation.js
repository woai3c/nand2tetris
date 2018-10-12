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
        let key, val, temp

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val === 'class') {
            this.output += '<class>'
            this.output += `<${key}> ${val} </${key}>`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key === 'identifier') {
                this.output += `<${key}> ${val} </${key}>`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val === '{') {
                    this.output += `<${key}> ${val} </${key}>`

                    while (this.i < this.len) {
                        let line
                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        line = temp[2]
                        console.log(key, val)
                        switch (val) {
                            case 'static':
                            case 'filed':
                                this._compileClassVarDec(key, val)
                                break
                            case 'constructor':
                            case 'function':
                            case 'method':
                                this._compileSubroutine(key, val)
                                break
                            default:
                                let error = 'line:' + line + ' syntax error: {' + key + ': ' + val 
                                          + '} expect keyword static | field | constructor | function | method'
                                          + '\r\nat ' + this.fileName
                                throw error
                        }
                    }
                } else {
                    this._error(key, val, '{')
                }
            } else {
                this._error(key, val, 'identifier')
            }

            this.output += '</class>'
            this.createXMLFile()
        } else {
            this._error(key, val, 'class')
        }
    },

    _compileClassVarDec(key, val) {
        let temp
        this.output += '<classVarDec>'
        this.output += `<${key}> ${val} </${key}>`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key === 'keyword' || key === 'identifier') {
            this.output += `<${key}> ${val} </${key}>`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                this._error(key, val, 'identifier')
            }

            while (key === 'identifier') {
                this.output += `<${key}> ${val} </${key}>`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val === ';') {
                    this.output += `<${key}> ${val} </${key}>`
                    break
                } else if (val === ',') {
                    this.output += `<${key}> ${val} </${key}>`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                } else {
                    this._error(key, val, 'symbol')
                }
            } 
        } else {
            this._error(key, val, 'keyword')
        }

        this.output += '</classVarDec>'
    },

    _compileSubroutine(key, val) {
        let temp
        this.output += '<subroutineDec>'
        this.output += `<${key}> ${val} </${key}>`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key !== 'identifier' && key !== 'keyword') {
            this._error(key, val, 'identifier | keyword')
        }

        while (key === 'identifier' || key === 'keyword') {
            this.output += `<${key}> ${val} </${key}>`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
        }

        if (val === '(') {
            this.output += `<${key}> ${val} </${key}>`
            this._compileParameterList()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val === ')') {
                this.output += `<${key}> ${val} </${key}>`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val === '{') {
                    this._compileSubroutineBody(key, val)
                } else {
                    this._error(key, val, '{')
                }
            } else {
                this._error(key, val, ')')
            }
        } else {
            this._error(key, val, '(')
        }

        this.output += '</subroutineDec>'
    },

    _compileSubroutineBody(key, val) {
        let temp, line
        this.output += '<subroutineBody>'
        this.output += `<${key}> ${val} </${key}>`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        line = temp[2]

        switch (val) {
            case 'if':
                this._compileIf(key, val)
                break
            case 'while':
                this._compileWhile(key, val)
                break
            case 'do':
                this._compileDo(key, val)
                break
            case 'return':
                this._compileReturn(key, val)
                break
            case 'let':
                this._compileLet(key, val)
                break
            case 'var':
                this._compileVarDec(key, val)
                break
            default:
                let error = 'line:' + line + ' syntax error: {' + key + ': ' + val 
                          + '} expect keyword if | while | do | return | let | var'
                          + '\r\nat ' + this.fileName
                throw error
        }

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val === '}') {
            this.output += `<${key}> ${val} </${key}>`
        } else {
            error(key, val, '}')
        }
        this.output += '</subroutineBody>'
    },

    _compileParameterList() {
        let key, val, temp
        this.output += '<parameterList>'
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val !== ')') {
            if (key !== 'keyword') {
                error(key, val, 'keyword')
            } else {
                while (key === 'keyword') {
                    this.output += `<${key}> ${val} </${key}>`

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    if (key === 'identifier') {
                        this.output += `<${key}> ${val} </${key}>`

                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        if (val === ',') {
                            this.output += `<${key}> ${val} </${key}>`
                            temp = this._getNextToken()
                            key = temp[0]
                            val = temp[1]
                        }
                    } else {
                        error(key, val, 'identifier')
                    }
                }
            }
        }
        
        this.output += '</parameterList>'
        this.i--
    },

    _compileVarDec(key, val) {
        let temp
        this.output += '<VarDec>'
        this.output += `<${key}> ${val} </${key}>`
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (key === 'keyword' || key === 'identifier') {
            this.output += `<${key}> ${val} </${key}>`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                error(key, val, 'identifier')
            }

            while (key === 'identifier') {
                this.output += `<${key}> ${val} </${key}>`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val === ',') {
                   this.output += `<${key}> ${val} </${key}>`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 
                } else if (val === ';') {
                    this.output += `<${key}> ${val} </${key}>`
                    break
                } else {
                    error(key, val, ', | ;')
                }
            }
        } else {
            error(key, val, 'keyword | identifier')
        }

        this.output += '</VarDec>'
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

    _getNextToken() {
        this.i++
        let obj = this.tokens[this.i]
        let key = Object.keys(obj)[0]
        let val = obj[key]

        return [key, val, obj.line]
    },

    _error(key, val, type) {
        let error = 'line:' + this.tokens[this.i].line + ' syntax error: {' + key + ': ' + val 
                  + '}\r\nExpect the type of key to be ' + type + '\r\nat ' + this.fileName
        throw error
    }
}

module.exports = CompilationEngine