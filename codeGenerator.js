const fs = require('fs')
const arry = process.argv

codeGenerator(arry[2], arry[3], arry[4], arry.slice(5))

function codeGenerator(door, bits, outPin, inPin) {
    let codes = ''
    if (inPin.length == 1) {
        for (let i = 0; i < bits; i++) {
            codes += `\t${door}(in = ${inPin}[${i}], out = ${outPin}[${i}]);\n`
        }
        fs.writeFile('code.txt', codes, res => {
            console.log(res)
        })
    } else if (inPin.length == 2) {
        for (let i = 0; i < bits; i++) {
            codes += `\t${door}(${inPin[0]} = ${inPin[0]}[${i}], ${inPin[1]} = ${inPin[1]}[${i}], out = ${outPin}[${i}]);\n`
        }
        fs.writeFile('code.txt', codes, res => {
            console.log(res)
        })
    }
}