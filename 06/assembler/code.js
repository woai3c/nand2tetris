export function dest(instruction) {
    if (instruction.includes('=')) {
        let dest = instruction.split('=')[0].trim()
        const temp = ['0', '0', '0']
        [...dest].forEach(key => {
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

export function comp(instruction) {
    if (instruction.includes(';')) {
        let jump = instruction.split(';')[1].trim()
        const set = {
            JGT: '001',
            JEQ: '010',
            JGE: '011',
            JLT: '100',
            JNE: '101',
            JLE: '110',
            JMP: '111',
        }

        return set[jump]
    } 

    return '000'
}

export function jump(instruction) {
    if (instruction.includes(';')) {
        let jump = instruction.split(';')[1].trim()
        const set = {
            JGT: '001',
            JEQ: '010',
            JGE: '011',
            JLT: '100',
            JNE: '101',
            JLE: '110',
            JMP: '111',
        }

        return set[jump]
    } 

    return '000'
}