function SymbolTable() {
    this.table = {}
    this.kindIndex = {
        static: 0,
        field: 0,
        argument: 0,
        local: 0
    }
}

SymbolTable.prototype = {
    startSubroutine() {
        this.table = {}
        this.kindIndex = {
            static: 0,
            field: 0,
            argument: 0,
            local: 0
        }
    },

    define(name, type, kind) {
        this.table[name] = [type, kind, this.kindIndex[kind]++]
    },

    varCount(kind) {
        return this.kindIndex[kind]
    },

    kindOf(name) {
        let val = this.table[name]
        if (val === undefined) {
            return 'none'
        } else {
            return val[1]
        }
    },

    typeOf(name) {
        let val = this.table[name]
        if (val === undefined) {
            return 'none'
        } else {
            return val[0]
        }
    },

    indexOf(name) {
        let val = this.table[name]
        if (val === undefined) {
            return 'none'
        } else {
            return val[2]
        }
    }
}

module.exports = SymbolTable