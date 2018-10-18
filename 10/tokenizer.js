const fs = require('fs')

function JackTokenizer(data, fileName) {
    this.data = data
    this.rawData = data.slice()
    this.tokens = []    
    this.rawFile = fileName + '.jack'
    this.outputPath = fileName + 'T.xml'
    // 单行注释
    this.notesRe1 = /^(\/\/)/
    /* */
    this.notesRe2 = /^(\/\*).*(\*\/)$/
    /** */
    this.notesRe3 = /^(\/\*\*).*(\*\/)$/
    // 匹配行中的注释
    this.re1 = /(\/\/).*/
    this.re2 = /(\/\*).*(\*\/)/
    this.re3 = /(\/\*\*).*(\*\/)/
    // 匹配多行注释
    this.reg1 = /^(\/\*)/
    this.reg2 = /^(\/\*\*)/
    this.reg3 = /^\*[^\/]/
    this.reg4 = /^(\*\/)/
    this.reg5 = /^\*[^\/].*(\*\/)$/

    // 单个字符匹配
    this.wordRe = /\w|_/

    // 标识符
    this.identifierRe = /^[^\d].*/

    // 字符串常量
    this.strRe = /^".*"$/
    this.strRe1 = /^"/
    this.strRe2 = /"$/

    // 行数
    this.line = 0
    this.keywordType = [
                        'class', 'constructor', 'function', 'method', 'field', 'static', 'var', 'int', 'char', 'boolean',
                        'void', 'true', 'false', 'null', 'this', 'let', 'do', 'if', 'else', 'while', 'return'
                    ]
    this.symbolType = [
                        '{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~',
                        '&lt;', '&gt;', '&amp;'
                    ]

    this._init()
}

JackTokenizer.prototype = {
    _init() {
        const data = this.data

        while (this._hasMoreTokens(data)) {
            let str = data.shift().trim()
            this.line++

            if (this._isVaildStr(str)) {
                // 清除字符串中的注释
                str = str.replace(this.re1, '')
                str = str.replace(this.re2, '')
                str = str.replace(this.re3, '').trim()
                this._lexicalAnalysis(str)
            }
        }

        this.createXMLFile()
    },

    _hasMoreTokens(data) {
        return data.length > 0? true : false
    },

    _advance(token) {
        const type = this._tokenType(token)

        switch (type) {
            case 'keyword':
                this._keyword(token)
                break
            case 'symbol':
                this._symbol(token)
                break
            case 'int-const':
                this._intVal(token)
                break
            case 'identifier':
                this._identifier(token)
                break
            case 'string_const':
                this._stringVal(token)
                break
        }
    },

    _tokenType(token) {
        if (this.keywordType.includes(token)) {
            return 'keyword'
        } else if (this.symbolType.includes(token)) {
            return 'symbol'
        } else if (this.strRe.test(token)) {
            return 'string_const'
        } else if (this.identifierRe.test(token)) {
            return 'identifier'
        } else if (0 <= parseFloat(token) <= 32767) {
            return 'int-const'
        } else {
            let error = 'line:' + this.line + ' syntax error:' + token + '\r\n' 
                      + this.rawData[this.line - 1].trim() + '\r\nat ' + this.rawFile
            throw error
        }
    },

    _keyword(token) {
        this.tokens.push({keyword: token, line: this.line})
    },

    _symbol(token) {
        this.tokens.push({symbol: token, line: this.line})
    },

    _identifier(token) {
        this.tokens.push({identifier: token, line: this.line})
    },

    _intVal(token) {
        this.tokens.push({integerConstant: token, line: this.line})
    },

    _stringVal(token) {
        token = token.replace(this.strRe1, '')
        token = token.replace(this.strRe2, '')

        this.tokens.push({stringConstant: token, line: this.line})
    },

    _isVaildStr(str) {
        if (this.notesRe1.test(str) || this.notesRe2.test(str) || this.notesRe3.test(str)) {
            return false
        } else if (this.reg1.test(str) || this.reg2.test(str)) {
 
            while (this._hasMoreTokens(this.data)) {
                this.line++
                str = this.data.shift().trim()

                if (this.reg4.test(str) || this.reg5.test(str)) {
                    break
                } else if (this.reg3.test(str)) {
                    continue
                }
            }

            return false
        } else if (str === '') {
            return false
        }

        return true
    },

    _lexicalAnalysis(str) {
        // c=a+b; 分割成 ['c', '=', 'a', '+', 'b', ';']
        const tokens = str.split('')
        let i = 0
        let len = tokens.length
        let token = ''
        let word 

        while (true) {
            word = tokens[i]

            if (this.wordRe.test(word)) {
                token += word
                i++
            } else if (word === ' ') {
                if (token !== '') {
                    this._advance(token)
                    token = ''
                    i++
                } else {
                    i++
                }
            } else if (this.symbolType.includes(word)) {
                switch (word) {
                    case '>':
                        word = '&gt;'
                        break
                    case '<':
                        word = '&lt;'
                        break
                    case '&':
                        word = '&amp;'
                        break
                }

                if (token !== '') {
                    this._advance(token)
                    this._advance(word)
                    token = ''
                    i++
                } else {
                    this._advance(word)
                    i++
                }
                
            } else if (word === '"') {
                while (true) {
                    token += word
                    i++
                    word = tokens[i]
                    if (word === '"') {
                        token += word
                        this._advance(token)
                        token = ''
                        i++
                        break
                    }

                    if (i >= len) {
                        if (token !== '') {
                            this._advance(token)
                        }
                        break
                    }
                }
            }

            if (i >= len) {
                if (token !== '') {
                    this._advance(token)
                }
                break
            }
        }
    },

    getTokens() {
        return this.tokens
    },

    createXMLFile() {
        let output = '<tokens>\r\n'
        this.tokens.forEach(token => {
            const key = Object.keys(token)[0]
            const value = token[key]
            output += `<${key}> ${value} </${key}>\r\n`
        })
        output += '</tokens>'
        fs.writeFileSync(this.outputPath, output)
    }
}


module.exports = JackTokenizer