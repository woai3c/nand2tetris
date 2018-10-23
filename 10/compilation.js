const fs = require('fs')
const opObj = {
    '+': 'add',
    '-': 'sub',
    '&amp;': 'and',
    '|': 'or',
    '&lt;': 'lt',
    '&gt;': 'gt',
    '=': 'eq',
    '/': 'call Math.divide 2',
    '*': 'call Math.multiply 2'
}

function CompilationEngine(tokens, fileName) {
    this.outputPath = fileName + '.xml'
    this.rawFile = fileName + '.jack'
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

        if (val == 'class') {
            this.output += '<class>\r\n'
            this.output += `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
                    this.output += `<${key}> ${val} </${key}>\r\n`

                    while (this.i < this.len) {
                        let line
                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        line = temp[2]

                        if (val == '}') {
                            this.output += `<${key}> ${val} </${key}>\r\n`
                            break
                        }

                        switch (val) {
                            case 'static':
                            case 'field':
                                this._compileClassVarDec(key, val)
                                break
                            case 'constructor':
                            case 'function':
                            case 'method':
                                this._compileSubroutine(key, val)
                                break
                            default:
                                this._error(key, val, 'static | field | constructor | function | method')
                        }
                    }
                } else {
                    this._error(key, val, '{')
                }
            } else {
                this._error(key, val, 'identifier')
            }

            this.output += '</class>\r\n'
            this.createXMLFile()
        } else {
            this._error(key, val, 'class')
        }
    },

    _compileClassVarDec(key, val) {
        let temp
        
        this.output += '<classVarDec>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key == 'keyword' || key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                this._error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ';') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    break
                } else if (val == ',') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                } else {
                    this._error(key, val, ',|;')
                }
            } 
        } else {
            this._error(key, val, 'keyword')
        }

        this.output += '</classVarDec>\r\n'
    },

    _compileSubroutine(key, val) {
        let temp
        
        this.output += '<subroutineDec>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key != 'identifier' && key != 'keyword') {
            this._error(key, val, 'identifier | keyword')
        }

        while (key == 'identifier' || key == 'keyword') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
        }

        if (val == '(') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileParameterList()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ')') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
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

        this.output += '</subroutineDec>\r\n'
    },

    _compileSubroutineBody(key, val) {
        let temp, line
        
        this.output += '<subroutineBody>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        line = temp[2]

        while (true) {
            if (val == 'var') {
                this._compileVarDec(key, val)
            } else {
                this._compileStatements(key, val, line)
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            line = temp[2]

            if (val == '}') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                break
            } else {
                switch (val) {
                    case 'if':
                    case 'while':
                    case 'do':
                    case 'return':
                    case 'let':
                    case 'var':
                        break
                    default:
                        this._error(key, val, '}')
                }
            }
        }
        
        this.output += '</subroutineBody>\r\n'
    },

    _compileParameterList() {
        let key, val, temp
        

        this.output += '<parameterList>\r\n'
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val !== ')') {
            if (key !== 'keyword') {
                error(key, val, 'keyword')
            } else {
                while (key == 'keyword') {
                    this.output += `<${key}> ${val} </${key}>\r\n`

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    if (key == 'identifier') {
                        this.output += `<${key}> ${val} </${key}>\r\n`

                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        if (val == ',') {
                            this.output += `<${key}> ${val} </${key}>\r\n`
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
        
        this.output += '</parameterList>\r\n'
        this.i--
    },

    _compileVarDec(key, val) {
        let temp
        
        this.output += '<varDec>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (key == 'keyword' || key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ',') {
                   this.output += `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 
                } else if (val == ';') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    break
                } else {
                    error(key, val, ', | ;')
                }
            }
        } else {
            error(key, val, 'keyword | identifier')
        }

        this.output += '</varDec>\r\n'

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == 'var') {
            this._compileVarDec(key, val)
        } else {
            this.i--
        }
    },

    _compileStatements(key, val, line) {
        let temp
        
        this.output += '<statements>\r\n'

        while (val !== '}') {
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
                default:
                    this._error(key, val, 'if | while | do | return | let')
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1] 
            line = temp[2]
        }
        this.i--
        this.output += '</statements>\r\n'
    },

    _compileDo(key, val) {
        let temp
        
        this.output += '<doStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            this._compilePartOfCall(key, val)
            
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ';') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }  
        } else {
            this._error(key, val, 'identifier')
        }
        this.output += '</doStatement>\r\n'
    },

    _compileLet(key, val) {
        let temp
        
        this.output += '<letStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '[') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                this._compileExpression()
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ']') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == '=') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                        this._compileExpression()
                    } else {
                        this._error(key, val, '=')
                    }
                } else {
                    this._error(key, val, ']')
                }
            } else if (val == '=') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                this._compileExpression()
            } else {
                this._error(key, val, '[ | =')
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ';') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        } else {
            this._error(key, val, 'identifier')
        }
        this.output += '</letStatement>\r\n'
    },

    _compileWhile(key, val) {
        let temp
        
        this.output += '<whileStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == '(') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileExpression()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
                line = temp[2]

                if (val == '{') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    line = temp[2]
                    this._compileStatements(key, val, line)

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == '}') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                    } else {
                        this._error(key, val, '}')
                    }
                } else {
                    this._error(key, val, '{')
                }
            } else {
                this._error(key, val, ')')
            }
        } else {
            this._error(key, val, '(')
        }
        this.output += '</whileStatement>\r\n'
    },

    _compileIf(key, val) {
        let temp
        
        this.output += '<ifStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (val == '(') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileExpression()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    let line
                    key = temp[0]
                    val = temp[1] 
                    line = temp[2]

                    this._compileStatements(key, val, line)

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 

                    if (val == '}') {
                        this.output += `<${key}> ${val} </${key}>\r\n`

                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1] 

                        if (val == 'else') {
                            this._compileElse(key, val)
                        } else {
                            this.i--
                        }
                    } else {
                        this._error(key, val, '}')
                    }
                } else {
                    this._error(key, val, ')')
                }
            } else {
                this._error(key, val, ')')
            }
        } else {
            this._error(key, val, '(')
        }

        this.output += '</ifStatement>\r\n'
    },  

    _compileElse(key, val) {
        let temp, line
        this.output += `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == '{') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            line = temp[2]
            this._compileStatements(key, val, line)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '}') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, '}')
            }
        } else {
            this._error(key, val, '{')
        }
    },

    _compileReturn(key, val) {
        let temp
        
        this.output += '<returnStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == ';') {
            this.output += `<${key}> ${val} </${key}>\r\n`
        } else {
            this.i--
            this._compileExpression()
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ';') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        }
        
        this.output += '</returnStatement>\r\n'
    },

    _compileExpression() {
        this.output += '<expression>\r\n'
        this._compileTerm()

        let key, val, temp, op

        while (true) {
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1] 

            if (opObj[val] !== undefined) {
                this.output += `<${key}> ${val} </${key}>\r\n`
                this._compileTerm()
            } else {
                this.i--
                break
            }
        }

        this.output += '</expression>\r\n'
    },

    _compileTerm() {
         let key, val, temp
        this.output += '<term>\r\n'

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 
        
        if (key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1] 

            switch (val) {
                case '(':
                case '.':
                    this._compilePartOfCall(key, val)
                    break
                case '[':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    this._compileExpression()
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    
                    if (val == ']') {                       
                        this.output += `<${key}> ${val} </${key}>\r\n`
                    } else {
                        this._error(key, val, ']')
                    }
                    break
                default:
                    this.i--
            }
        } else if (key == 'integerConstant') {
            this.output += `<${key}> ${val} </${key}>\r\n`
        } else if (key == 'stringConstant') {
            this.output += `<${key}> ${val} </${key}>\r\n`
        } else {
            switch (val) {
                case '(':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    this._compileExpression()

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 

                    if (val == ')') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                    } else {
                        this._error(key, val, ')')
                    }
                    break
                case '-':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    this._compileTerm()
                    break
                case '~':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    this._compileTerm()
                    break
                case 'null':
                case 'false':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    break
                case 'true':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    break
                case 'this':
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    break
                default:
                    this._error(key, val, 'Unknown symbol')
            }
        }

        this.output += '</term>\r\n'
    },

    _compilePartOfCall(key, val) {
        let temp
        if (val == '(') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileExpressionList()
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ')')
            }
        } else if (val == '.') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
                if (val == '(') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    this._compileExpressionList()
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == ')') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                    } else {
                        this._error(key, val, ')')
                    }
                } else {
                    this.error(key, val, '(')
                }
            } else {
                this.error(key, val, 'identifier')
            }
        } else {
            this._error(key, val, '( | .')
        }
    },

    _compileExpressionList() {
        let key, val, temp
        
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        this.output += '<expressionList>\r\n'

        if (val == ')' || val == ',') {
            this.i--
        } else {
            this.i--
            while (true) {
                this._compileExpression()
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ',') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                } else if (val == ')') {
                    this.i--
                    break
                }
            }
        }

        this.output += '</expressionList>\r\n'
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
                  + '}\r\nExpect the type of key to be ' + type + '\r\nat ' + this.rawFile
        throw error
    }
}

module.exports = CompilationEngine