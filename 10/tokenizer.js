function JackTokenizer(data) {
    this.data = data
    this.tokens = []
    //
    this.notesRe1 = /^(\/\/)/
    /* */
    this.notesRe2 = /^(\/\*)(\*\/)$/
    /** */
    this.notesRe3 = /^(\/\*\*)(\*\/)$/
    // 匹配行中的注释
    this.re1 = /(\/\/).*/
    this.re2 = /(\/\*).*(\*\/)/
    this.re3 = /(\/\*\*).*(\*\/)/
    // 匹配多行注释
    this.reg1 = /^(\/\*)/
    this.reg2 = /^(\/\*\*)/
    this.reg3 = /^\*/
    this.reg4 = /(\*\/)$/
    // 字母
    this.wordRe = /[a-zA-Z]/
    // 数字
    this.numberRe = /\d/ 
    // 标识符
    this.identifierRe = /^[^\d].+/
    // 字符串常量
    this.strRe1 = /^"/
    this.strRe2 = /"$/

    this.keywordType = [
                        'class', 'constructor', 'function', 'method', 'field', 'static', 'var', 'int', 'char', 'boolean',
                        'void', 'true', 'false', 'null', 'this', 'let', 'do', 'if', 'else', 'while', 'return'
                    ]
    this.symbolType = ['{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~']

    this._init()
}

JackTokenizer.prototype = {
    _init() {
        const data = this.data
        while (this._hasMoreTokens(data)) {
            let str = data.shift().trim()

            if (this._isVaildStr(str)) {
                // 清除字符串中的注释
                str = str.replace(this.re1, '')
                str = str.replace(this.re2, '')
                str = str.replace(this.re3, '').trim()
                this._lexicalAnalysis(str)
            }
        }
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
        } else if (0 <= parseFloat(token) >= 32767) {
            return 'int-const'
        } else if (this.identifierRe.test(token)) {
            return 'identifier'
        } else if (this.strRe.test(token)) {
            return 'string_const'
        } else {
            throw '无效token' + token
        }
    },

    _keyword(token) {
        this.tokens.push({keyword: token})
    },

    _symbol(token) {
        this.tokens.push({symbol: token})
    },

    _identifier(token) {
        this.tokens.push({identifier: token})
    },

    _intVal(token) {
        this.tokens.push({integerConstant: token})
    },

    _stringVal(token) {
        token = token.replace(this.strRe1, '')
        token = token.replace(this.strRe2, '')

        this.tokens.push({stringConstant: token})
    },

    _isVaildStr(str) {
        if (this.notesRe1.test(str) || this.notesRe2.test(str) || this.notesRe3.test(str)) {
            return false
        } else if (this.reg1.test(str) || this.reg2.test(str)) {
            while (this._hasMoreTokens(this.data)) {
                str = this.data.shift().trim()
                if (this.reg3.test(str)) {
                    continue
                } else if (this.reg4.test(str)) {
                    break
                }
            }

            return false
        }

        return true
    },

    _lexicalAnalysis(str) {
        // c=a+b; 分割成 ['c', '=', 'a', '+', 'b', ';']
        const tokens = str.split('')
        let i = 0
        let j
        let len = tokens.length - 1
        let token = ''
        let word 

        while (true) {
            j = i
            word = tokens[i]

            if (this.wordRe.test(word)) {
                token += word
                i++
            } else if (this.numberRe.test(word)) {
                token += word
                i++
            } else if (word === ' ') {
                this._advance(token)
                i++
            } else if (this.symbolType.test(word)) {
                this._advance(token)
                this._advance(word)
                token = ''
                i++
            }


            if (i == len) {
                if (token !== '') {
                    this._advance(token)
                }
                break
            }
        }
    },

    getTokens() {
        return this.tokens
    }
}


module.exports = JackTokenizer