import {addEntry, contains, getAddress, ramAddress} from './symbol-table.js'

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
        type = commandType(current)

        switch (type) {
            case 'C':
                dest(current)
                comp(current)
                jump(current)
                break
            case 'A':
            case 'L':
                let token = symbol(current, type)

                if (isNaN(parseInt(token))) {
                    if (!contains(token)) {
                        addEntry(token, ramAddress++)
                    }
                } else {

                }
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