// jump域集合
const jSet = {
    JGT: '001',
    JEQ: '010',
    JGE: '011',
    JLT: '100',
    JNE: '101',
    JLE: '110',
    JMP: '111',
}
// comp域集合
const cSet = {
    '0': '0101010',
    '1': '0111111',
    '-1': '0111010',
    'D': '0001100',
    'A': '0110000',
    'M': '1110000',
    '!D': '0001101',
    '!A': '0110001',
    '!M': '1110001',
    '-D': '0001111',
    '-A': '0110011',
    '-M': '1110011',
    'D+1': '0011111',
    'A+1': '0110111',
    'M+1': '1110111',
    'D-1': '0001110',
    'A-1': '0110010',
    'M-1': '1110010',
    'D+A': '0000010',
    'D+M': '1000010',
    'D-A': '0010011',
    'D-M': '1010011',
    'A-D': '0000111',
    'M-D': '1000111',
    'D&A': '0000000',
    'D&M': '1000000',
    'D|A': '0010101',
    'D|M': '1010101',
}

// 解析dest域
function dest(instruction) {
    if (instruction.includes('=')) {
        let dest = instruction.split('=')[0].trim()
        const temp = ['0', '0', '0']
        Array.from(dest).forEach(key => {
            switch (key) {
                case 'A':
                    temp[0] = '1'
                    break
                case 'D':
                    temp[1] = '1'
                    break
                case 'M':
                    temp[2] = '1'
                    break
            }
        })

        return temp.join('')
    } 

    return '000'
}

// 解析comp域
function comp(instruction) {
    let comp = instruction
    let binary
    if (comp.includes('=')) {
        comp = comp.split('=')[1].trim()
    }
    if (comp.includes(';')) {
        comp = comp.split(';')[0].trim()
    }
    comp = comp.split(' ').join('')
    binary = cSet[comp]
    if (binary !== undefined) {
        return binary
    } else if (comp.includes('+') || comp.includes('|') || comp.includes('&')) {
        comp = comp.split('').reverse().join('')
        binary = cSet[comp]
        if (binary !== undefined) {
            return binary
        }
    } 

    throw '无效指令'
}

// 解析jump域
function jump(instruction) {
    if (instruction.includes(';')) {
        let jump = instruction.split(';')[1].trim()
    
        return jSet[jump]
    } 

    return '000'
}

module.exports = {
    dest,
    comp,
    jump
}