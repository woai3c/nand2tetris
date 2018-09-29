import {addEntry, contains, getAddress, ramAddress, binaryOut} from './symbol-table.js'
import {dest, comp, jump} from './code.js'

export default function parser(instructions) {
    advance(instructions)
}

function hasMoreCommands(instructions) {
    return instructions.length > 0? true : false
}

function advance(instructions) {
    let current, type
    while (hasMoreCommands(instructions)) {
        current = instructions.shift().trim()

        if (isInstructionInvalid(current)) {
            continue
        }

        type = commandType(current)

        switch (type) {
            case 'C':
                let d = dest(current)
                let c = comp(current)
                let j = jump(current)
                break
            case 'A':
            case 'L':
                let token = symbol(current, type)
                let binary
                if (isNaN(parseInt(token))) {
                    if (contains(token)) {
                        binary = int2Binary(getAddress(token))
                    } else {
                        binary = int2Binary(ramAddress)
                        addEntry(token, ramAddress++)
                    }
                } else {
                    binary = int2Binary(token)
                }
                binaryOut += binary
                break
        }
    }
}

function commandType(instruction) {
    if (instruction.charAt(0) === '#') {
        return 'A'
    } else if (instruction.charAt(0) === '(') {
        return 'L'
    } else {
        return 'C'
    }
}

function symbol(instruction, type) {
    const reg = /^\((.+)\)$/
    if (type === 'A') {
        return instruction.substr(1)
    } else if (type === 'L') {
        return instruction.replace(re, '$1')
    }
}

function int2Binary(num) {
    let str = num.toString(2)

    while (str.length !== 16) {
        str = '0' + str
    }

    return str
}

function isInstructionInvalid(instruction) {
    const reg = /^(\/\/)/
    if (instruction == '' || reg.test(instruction)) {
        return true
    }
    return false
}