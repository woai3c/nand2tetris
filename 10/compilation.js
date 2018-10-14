const fs = require('fs')

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
        // 缩进
        let indent = this._createSpace(2)
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == 'class') {
            this.output += '<class>\r\n'
            this.output += indent + `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += indent + `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
                    this.output += indent + `<${key}> ${val} </${key}>\r\n`

                    while (this.i < this.len) {
                        let line
                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        line = temp[2]

                        if (val == '}') {
                            this.output += indent + `<${key}> ${val} </${key}>\r\n`
                            break
                        }

                        switch (val) {
                            case 'static':
                            case 'field':
                                this._compileClassVarDec(key, val, indent)
                                break
                            case 'constructor':
                            case 'function':
                            case 'method':
                                this._compileSubroutine(key, val, indent)
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

    _compileClassVarDec(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<classVarDec>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key == 'keyword' || key == 'identifier') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                this._error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ';') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    break
                } else if (val == ',') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
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

        this.output += indent + '</classVarDec>\r\n'
    },

    _compileSubroutine(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<subroutineDec>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key != 'identifier' && key != 'keyword') {
            this._error(key, val, 'identifier | keyword')
        }

        while (key == 'identifier' || key == 'keyword') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
        }

        if (val == '(') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            this._compileParameterList(indent2)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ')') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
                    this._compileSubroutineBody(key, val, indent2)
                } else {
                    this._error(key, val, '{')
                }
            } else {
                this._error(key, val, ')')
            }
        } else {
            this._error(key, val, '(')
        }

        this.output += indent + '</subroutineDec>\r\n'
    },

    _compileSubroutineBody(key, val, indent) {
        let temp, line
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<subroutineBody>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        line = temp[2]

        while (true) {
            if (val == 'var') {
                this._compileVarDec(key, val, indent2)
            } else {
                this._compileStatements(key, val, line, indent2)
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            line = temp[2]

            if (val == '}') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
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
        
        this.output += indent + '</subroutineBody>\r\n'
    },

    _compileParameterList(indent) {
        let key, val, temp
        let indent2 = indent + this._createSpace(2)

        this.output += indent + '<parameterList>\r\n'
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val !== ')') {
            if (key !== 'keyword') {
                error(key, val, 'keyword')
            } else {
                while (key == 'keyword') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    if (key == 'identifier') {
                        this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1]
                        if (val == ',') {
                            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
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
        
        this.output += indent + '</parameterList>\r\n'
        this.i--
    },

    _compileVarDec(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<varDec>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (key == 'keyword' || key == 'identifier') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ',') {
                   this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 
                } else if (val == ';') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    break
                } else {
                    error(key, val, ', | ;')
                }
            }
        } else {
            error(key, val, 'keyword | identifier')
        }

        this.output += indent + '</varDec>\r\n'

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == 'var') {
            this._compileVarDec(key, val, indent)
        } else {
            this.i--
        }
    },

    _compileStatements(key, val, line, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<statements>\r\n'

        while (val !== '}') {
            switch (val) {
                case 'if':
                    this._compileIf(key, val, indent2)
                    break
                case 'while':
                    this._compileWhile(key, val, indent2)
                    break
                case 'do':
                    this._compileDo(key, val, indent2)
                    break
                case 'return':
                    this._compileReturn(key, val, indent2)
                    break
                case 'let':
                    this._compileLet(key, val, indent2)
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
        this.output += indent + '</statements>\r\n'
    },

    _compileDo(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<doStatement>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            this._compilePartOfCall(key, val, indent2)
            
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ';') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }  
        } else {
            this._error(key, val, 'identifier')
        }
        this.output += indent + '</doStatement>\r\n'
    },

    _compileLet(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<letStatement>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '[') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                this._compileExpression(indent2)
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ']') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == '=') {
                        this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                        this._compileExpression(indent2)
                    } else {
                        this._error(key, val, '=')
                    }
                } else {
                    this._error(key, val, ']')
                }
            } else if (val == '=') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                this._compileExpression(indent2)
            } else {
                this._error(key, val, '[ | =')
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ';') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        } else {
            this._error(key, val, 'identifier')
        }
        this.output += indent + '</letStatement>\r\n'
    },

    _compileWhile(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<whileStatement>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == '(') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            this._compileExpression(indent2)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
                line = temp[2]

                if (val == '{') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    line = temp[2]
                    this._compileStatements(key, val, line, indent2)

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == '}') {
                        this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
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
        this.output += indent + '</whileStatement>\r\n'
    },

    _compileIf(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<ifStatement>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (val == '(') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            this._compileExpression(indent2)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == '{') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    let line
                    key = temp[0]
                    val = temp[1] 
                    line = temp[2]

                    this._compileStatements(key, val, line, indent2)

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1] 

                    if (val == '}') {
                        this.output += indent2 + `<${key}> ${val} </${key}>\r\n`

                        temp = this._getNextToken()
                        key = temp[0]
                        val = temp[1] 

                        if (val == 'else') {
                            this._compileElse(key, val, indent)
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

        this.output += indent + '</ifStatement>\r\n'
    },  

    _compileElse(key, val, indent) {
        let temp, line
        this.output += indent + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == '{') {
            this.output += indent + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            line = temp[2]
            this._compileStatements(key, val, line, indent)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '}') {
                this.output += indent + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, '}')
            }
        } else {
            this._error(key, val, '{')
        }
    },

    _compileReturn(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<returnStatement>\r\n'
                     + indent2 + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val == ';') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
        } else {
            this.i--
            this._compileExpression(indent2)
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ';') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        }
        
        this.output += indent + '</returnStatement>\r\n'
    },

    _compileExpression(indent) {
        let key, val, temp, line
        let indent2 = indent + this._createSpace(2)

        this.output += indent + '<expression>\r\n'
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 
        line = temp[2]

        if (val == ',') {
            let error = 'line:' + line + ' The expression should not begin with a ,'
                      + '\r\nat ' + this.rawFile
            throw error
        }

        while (true) {
            if (key == 'identifier' || key == 'integerConstant' || key == 'stringConstant') {
                this._compileTerm(key, val, indent2)
            } else if (val == '-' || val == '~') {
                let preObj = this.tokens[this.i - 1]
                let preKey = Object.keys(preObj)[0]
                let preVal = preObj[key]
                
                if (preKey == 'identifier' || preVal == ')') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                } else {
                    this._compileTerm(key, val, indent2)
                }
            } else {
                switch (val) {
                    case 'true':
                    case 'false':
                    case 'null':
                    case 'this':
                    case '(':
                        this._compileTerm(key, val, indent2)
                        break
                    default:
                        this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                }
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')' || val == ';' || val == ']' || val == ',') {
                this.i--
                break
            }
        }

        this.output += indent + '</expression>\r\n'
    },

    _compileTerm(key, val, indent) {
        let temp
        let indent2 = indent + this._createSpace(2)
        this.output += indent + '<term>\r\n'
                     
        if (val == '(') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            this._compileExpression(indent2)

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ')') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val , ')')
            }
        } else if (val == '-' || val == '~') {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val != ')' && val != ']') {
                this._compileTerm(key, val, indent2)
            } 
        } else {
            this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '[') {
                this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                this._compileExpression(indent2)
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
                
                if (val == ']') {                       
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                } else {
                    this._error(key, val, ']')
                }
            } else if (val == '.' || val == '(') {
                this._compilePartOfCall(key, val, indent2)
            } else {
                this.i--
            }
        }

        this.output += indent + '</term>\r\n'
    },

    _compilePartOfCall(key, val, indent) {
        let temp
        if (val == '(') {
            this.output += indent + `<${key}> ${val} </${key}>\r\n`
            this._compileExpressionList(indent)
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')') {
                this.output += indent + `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ')')
            }
        } else if (val == '.') {
            this.output += indent + `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += indent + `<${key}> ${val} </${key}>\r\n`
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
                if (val == '(') {
                    this.output += indent + `<${key}> ${val} </${key}>\r\n`
                    this._compileExpressionList(indent)
                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]

                    if (val == ')') {
                        this.output += indent + `<${key}> ${val} </${key}>\r\n`
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

    _compileExpressionList(indent) {
        let key, val, temp
        let indent2 = indent + this._createSpace(2)
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        this.output += indent + '<expressionList>\r\n'

        if (val == ')' || val == ',') {
            this.i--
        } else {
            this.i--
            while (true) {
                this._compileExpression(indent2)
                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]

                if (val == ',') {
                    this.output += indent2 + `<${key}> ${val} </${key}>\r\n`
                } else if (val == ')') {
                    this.i--
                    break
                }
            }
        }

        this.output += indent + '</expressionList>\r\n'
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
    },

    _createSpace(num) {
        let space = ''
        while (num--) {
            space += ' '
        }
        return space
    }
}

module.exports = CompilationEngine