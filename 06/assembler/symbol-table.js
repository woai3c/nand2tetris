const table = {}
let binaryOut = ''
let ramAddress 

function constructor() {
    ramAddress = 16
    table.SP = 0
    table.LCL = 1
    table.ARG = 2
    table.THIS = 3
    table.THAT = 4
    table.SCREEN = 16384
    table.KBD = 24576

    let num = 16
    let key

    while (num--) {
        key = `R${num}`
        table[key] = num
    }
}

function addEntry(symbol, address) {
    table[symbol] = address
}

function contains(symbol) {
    return table[symbol]? true : false
}

function getAddress(symbol) {
    return table[symbol]
}

export default {
    table,
    ramAddress,
    constructor,
    addEntry,
    contains,
    getAddress,
    binaryOut,
}