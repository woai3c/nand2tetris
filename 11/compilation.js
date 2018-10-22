const fs = require('fs')
const SymbolTable = require('./symbolTable')
const VMWriter = require('./VMWriter')
// 类表
let mainTable
// 子程序表
let subTable
// VMWriter实例 
let vm 
// 局部变量个数
let localNum = 0
// 函数名
let funcName = ''
// 参数个数
let nArgs = 0
// 双层括号
let double = false
// 是否构造函数
let isCtr = false
// 是否方法
let isMethod = false
// 调用方法的变量
let variableOfCall = ''

const ifTrueLabel = 'IF_TRUE'
const ifFalseLabel = 'IF_FALSE'
const ifEndLabel = 'IF_END'

const whileLabel = 'WHILE_EXP'
const whileEndLabel = 'WHILE_END'

// if
let ifIndex = 0
// while
let whileIndex = 0

let opArry = []
const opObj = {
    '+': 'add',
    '-': 'sub',
    '&amp;': 'and',
    '|': 'or',
    '&lt;': 'lt',
    '&gt;': 'gt',
    '=': 'eq',
    '~': 'not',
    '/': 'call Math.divide 2',
    '*': 'call Math.multiply 2'
}

function CompilationEngine(tokens, fileName) {
    this.fileName = fileName
    // 类名
    this.class = ''
    this.outputPath = fileName + '.xml'
    this.rawFile = fileName + '.jack'
    this.tokens = tokens
    this.len = tokens.length
    this.output = ''
    // index
    this.i = -1

    this._init()
}

CompilationEngine.prototype = {
    _init() {
        mainTable = new SymbolTable()
        subTable = new SymbolTable()
        vm = new VMWriter(this.fileName)

        this._compileClass()
        vm.createVMFile()
    },

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
                this.class = val
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
                                if (val == 'constructor') {
                                    isCtr = true
                                    isMethod = false
                                } else if (val == 'method') {
                                    isCtr = false
                                    isMethod = true
                                } else {
                                    isMethod = false
                                    isCtr = false
                                }
                                // 重置子符号表
                                subTable.startSubroutine()
                                funcName = ''
                                localNum = 0
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
        // type, kind 变量的类型和种类
        let temp, type, kind
        kind = val
        this.output += '<classVarDec>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]
        if (key == 'keyword' || key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`

            type = val
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                this._error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                // 符号表收集变量的各个参数
                mainTable.define(val, type, kind)

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
        if (key == 'identifier' || key == 'keyword') {
            this.output += `<${key}> ${val} </${key}>\r\n`

            if (isCtr) {
                funcName += val
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                if (isCtr) {
                    funcName += '.' + val
                } else {
                    // 函数名
                    funcName = this.class + '.' + val
                }

                temp = this._getNextToken()
                key = temp[0]
                val = temp[1]
            } else {
                this._error(key, val, 'identifier')
            }
        } else {
            this._error(key, val, 'identifier | keyword')
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
                vm.writeFunction(funcName, localNum)
                if (isCtr) {
                    // 构造函数
                    let fieldNum = mainTable.varCount('field')
                    vm.writePush('constant', fieldNum)
                    vm.writeCall('Memory.alloc', 1)
                    vm.writePop('pointer', 0)
                } else if (isMethod) {
                    // 方法
                    vm.writePush('argument', 0)
                    vm.writePop('pointer', 0)
                }

                isCtr = false
                isMethod = false
                funcName = ''
                localNum = 0
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
        let key, val, temp, type

        this.output += '<parameterList>\r\n'
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (val !== ')') {
            if (key !== 'keyword' && key !== 'identifier') {
                this._error(key, val, 'keyword | identifier')
            } else {
                while (key == 'keyword' || key == 'identifier') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    // 类型
                    type = val

                    temp = this._getNextToken()
                    key = temp[0]
                    val = temp[1]
                    if (key == 'identifier') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                        // 种类
                        subTable.define(val, type, 'argument')

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
                        this._error(key, val, 'identifier')
                    }
                }
            }
        }
        
        this.output += '</parameterList>\r\n'
        this.i--
    },

    _compileVarDec(key, val) {
        let temp, type
        
        this.output += '<varDec>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`
        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        if (key == 'keyword' || key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            // 类型
            type = val

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key !== 'identifier') {
                this._error(key, val, 'identifier')
            }

            while (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`

                // 定义局部变量
                subTable.define(val, type, 'local')
                // 局部变量个数+1
                localNum++

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
                    this._error(key, val, ', | ;')
                }
            }
        } else {
            this._error(key, val, 'keyword | identifier')
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
                    if (isMethod) {
                        nArgs++
                        if (variableOfCall) {
                            this._writeVariable(variableOfCall)
                            variableOfCall = ''
                        } else {
                            vm.writePush('pointer', 0)
                        }
                    }
                    vm.writeCall(funcName, nArgs)
                    vm.writePop('temp', 0)
                    funcName = ''
                    nArgs = 0
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
        let funcTempArry 

        this.output += '<doStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            funcTempArry = this._getTypeOfVariable(val)
            if (funcTempArry[1]) {
                isMethod = true
                funcName += funcTempArry[0]
                variableOfCall = val
            } else {
                funcName += val
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == '.') {
                this._compilePartOfCall(key, val)
            } else if (val == '(') {
                isMethod = true
                funcName = this.class + '.' + funcName
                this._compilePartOfCall(key, val)
            } else {
                this._error(key, val, '. | )')
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
        this.output += '</doStatement>\r\n'
    },

    _compileLet(key, val) {
        let temp
        let variable = ''
        this.output += '<letStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1] 

        if (key == 'identifier') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            variable += val

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

                    this._writeVariable(variable)
                    vm.writeArithmetic('add')
                    if (val == '=') {
                        this.output += `<${key}> ${val} </${key}>\r\n`
                        this._compileExpression()

                        vm.writePop('temp', 0)
                        vm.writePop('pointer', 1)
                        vm.writePush('temp', 0)
                        vm.writePop('that', 0)
                    } else {
                        this._error(key, val, '=')
                    }
                } else {
                    this._error(key, val, ']')
                }
            } else if (val == '=') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                this._compileExpression()
                // pop

                this._writeVariable(variable, true)
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
        let tempIndex = whileIndex++
        
        this.output += '<whileStatement>\r\n'
                     + `<${key}> ${val} </${key}>\r\n`

        temp = this._getNextToken()
        key = temp[0]
        val = temp[1]

        vm.writeLabel(whileLabel + tempIndex)
        if (val == '(') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileExpression()
            vm.writeArithmetic('not')
            vm.writeIf(whileEndLabel + tempIndex)

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

                    vm.writeGoto(whileLabel + tempIndex)
                    vm.writeLabel(whileEndLabel + tempIndex)

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
        let tempIndex = ifIndex++

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

                vm.writeIf(ifTrueLabel + tempIndex)
                vm.writeGoto(ifFalseLabel + tempIndex)

                if (val == '{') {
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    temp = this._getNextToken()
                    let line
                    key = temp[0]
                    val = temp[1] 
                    line = temp[2]

                    vm.writeLabel(ifTrueLabel + tempIndex)

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
                            vm.writeGoto(ifEndLabel + tempIndex)
                            vm.writeLabel(ifFalseLabel + tempIndex)
                            this._compileElse(key, val)
                            vm.writeLabel(ifEndLabel + tempIndex)
                        } else {
                            vm.writeLabel(ifFalseLabel + tempIndex)
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
            vm.writePush('constant', 0)
            vm.writeReturn()
            this.output += `<${key}> ${val} </${key}>\r\n`
        } else if (val == 'this') {
            vm.writePush('pointer', 0)
            this.i--
            this._compileExpression()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ';') {
                vm.writeReturn()
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        } else {
            this.i--
            this._compileExpression()
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ';') {
                vm.writeReturn()
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val, ';')
            }
        }
        
        this.output += '</returnStatement>\r\n'
    },

    _compileExpression() {
        let key, val, temp, line

        this.output += '<expression>\r\n'
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
            if (key == 'identifier') {
                let nextObj = this.tokens[this.i + 1]
                let nextKey = Object.keys(nextObj)[0]
                let nextVal = nextObj[nextKey]

                if (nextVal != '.' && nextVal != '[') {
                    this._writeVariable(val)
                    let preObj = this.tokens[this.i - 1]
                    let preKey = Object.keys(preObj)[0]
                    let preVal = preObj[preKey]

                    if (opArry.length && opObj[preVal] !== undefined) {
                        vm.writeArithmetic(opArry.pop())
                    }
                } else {
                    if (nextVal != '[') {
                        funcName += val
                    }
                }

                this._compileTerm(key, val)
            } else if (val == 'true' || val == 'null' || val == 'false') {
                switch (val) {
                    case 'null':
                    case 'false':
                        vm.writePush('constant', 0)
                        break
                    case 'true':
                        vm.writePush('constant', 0)
                        vm.writeArithmetic('not')
                        break
                }
                this._compileTerm(key, val)
            } else if (key == 'integerConstant' || key == 'stringConstant') {
                if (key == 'integerConstant') {
                    vm.writePush('constant', val)
                    let preObj = this.tokens[this.i - 1]
                    let preKey = Object.keys(preObj)[0]
                    let preVal = preObj[preKey]

                    if (opArry.length && opObj[preVal] !== undefined) {
                        vm.writeArithmetic(opArry.pop())
                    }
                } else {
                    let strArry = [...val]
                    let length = strArry.length
                    let code

                    vm.writePush('constant', length)
                    vm.writeCall('String.new', 1)
                    strArry.forEach(s => {
                        code = s.charCodeAt()
                        vm.writePush('constant', code)
                        vm.writeCall('String.appendChar', 2)
                    })
                }
                
                this._compileTerm(key, val, true)
            } else if (val == '-' || val == '~') { 
                let preObj = this.tokens[this.i - 1]
                let preKey = Object.keys(preObj)[0]
                let preVal = preObj[preKey]

                if (preKey == 'identifier' || preVal == ')' || preKey == 'integerConstant') {
                    // 正常的op
                    this.output += `<${key}> ${val} </${key}>\r\n`
                    if (val == '-') {
                        opArry.push(opObj[val])
                    } 
                } else {
                    // 针对负数和取反操作
                    this._compileTerm(key, val)

                    if (val == '-') {
                        vm.writeArithmetic('neg')
                    } else {
                        vm.writeArithmetic('not')
                    }
                }
            } else {
                switch (val) {
                    case 'this':
                        vm.writePush('pointer', 0)
                        this._compileTerm(key, val)
                        break
                    case '(':
                        this._compileTerm(key, val)
                        break
                    default:
                        this.output += `<${key}> ${val} </${key}>\r\n`
                        if (opObj[val] !== undefined) {
                            opArry.push(opObj[val])
                        }
                }
            }

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val == ')' || val == ';' || val == ']' || val == ',') {
                if (val == ')') {
                    let nextObj = this.tokens[this.i + 1]
                    let nextKey = Object.keys(nextObj)[0]
                    let nextVal = nextObj[nextKey]

                    if (nextVal == ')') {
                        if (double) {
                            if (opArry.length) {
                                vm.writeArithmetic(opArry.pop())
                            }
                            double = false
                        }
                    } else {
                        if (opArry.length) {
                            vm.writeArithmetic(opArry.pop())
                        }
                    }
                }
                this.i--
                break
            }
        }

        this.output += '</expression>\r\n'
    },
    // flag表示整数是否已经被处理过
    _compileTerm(key, val, flag) {
        let temp
        // 临时函数名
        let tempName

        this.output += '<term>\r\n'
                     
        if (val == '(') {
            let nextObj = this.tokens[this.i + 1]
            let nextKey = Object.keys(nextObj)[0]
            let nextVal = nextObj[nextKey]

            if (nextVal == '(') {
                double = true
            }

            this.output += `<${key}> ${val} </${key}>\r\n`
            this._compileExpression()

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]
            if (val == ')') {
                this.output += `<${key}> ${val} </${key}>\r\n`
            } else {
                this._error(key, val , ')')
            }
        } else if (val == '-' || val == '~') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (val != ')' && val != ']') {
                this._compileTerm(key, val)
            } 
        } else if (key == 'integerConstant') {
            this.output += `<${key}> ${val} </${key}>\r\n`
            // 如果整数没有被处理过
            if (!flag) {
                vm.writePush('constant', val)
            }
        } else {
            this.output += `<${key}> ${val} </${key}>\r\n`

            tempName = val
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
                    this._writeVariable(tempName)
                    vm.writeArithmetic('add')
                    vm.writePop('pointer', 1)
                    vm.writePush('that', 0)

                    let nextObj = this.tokens[this.i + 1]
                    let nextKey = Object.keys(nextObj)[0]
                    let nextVal = nextObj[nextKey]

                    if (opArry.length && nextVal != ')') {
                        vm.writeArithmetic(opArry.pop())
                    }
                } else {
                    this._error(key, val, ']')
                }
            } else if (val == '.') {
                this._compilePartOfCall(key, val)
                if (isMethod) {
                    nArgs++
                    vm.writePush('pointer', 0)
                }
                vm.writeCall(funcName, nArgs)
                funcName = ''
                nArgs = 0
            } else if (val == '(') {
                isMethod = true
                funcName = this.class + '.' + tempName
                this._compilePartOfCall(key, val)
                if (isMethod) {
                    nArgs++
                    vm.writePush('pointer', 0)
                }
                vm.writeCall(funcName, nArgs)
                funcName = ''
                nArgs = 0
            } else {
                this.i--
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
            funcName += val

            temp = this._getNextToken()
            key = temp[0]
            val = temp[1]

            if (key == 'identifier') {
                this.output += `<${key}> ${val} </${key}>\r\n`
                funcName += val

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
                nArgs++
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
    },

    _writeVariable(val, flag) {
        let segment = subTable.kindOf(val)
        if (segment == 'none') {
            segment = mainTable.kindOf(val)
            if (segment != 'none') {
                if (segment == 'field') {
                    segment = 'this'
                }
                if (flag) {
                    vm.writePop(segment, mainTable.indexOf(val))
                } else {
                    vm.writePush(segment, mainTable.indexOf(val))
                }
            }
        } else {
            if (flag) {
                vm.writePop(segment, subTable.indexOf(val))
            } else {
                vm.writePush(segment, subTable.indexOf(val))
            }
        }
    },

    _getTypeOfVariable(name) {
        let type = subTable.typeOf(name)
        if (type == 'none') {
            type = mainTable.typeOf(name)
            if (type == 'none') {
                return [name, false]
            } else {
                return [type, true]
            }
        } else {
            return [type, true]
        }
    }
}

module.exports = CompilationEngine