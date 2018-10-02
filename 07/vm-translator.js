const fs = require('fs')
const {parser} = require('./parser')

const fileName = process.argv[2]
const isDirectory = fs.lstatSync(fileName).isDirectory()

let assembleOut = ''
let outputFileName
init()

if (isDirectory) {
    outputFileName = fileName
    fs.readdir(fileName, (err, files) => {
        if (err) {
            throw err
        }

        files.forEach(file => {
            let tempArry = file.split('.')
            tempArry.pop() 
            let preName = tempArry.join('.')
            let data = fs.readFileSync(file, 'utf-8')
            processFileData(data, preName)
        })

        setFileName()
    })
} else {
    let tempArry = fileName.split('.')
    tempArry.pop() 
    let preName = tempArry.join('.')
    outputFileName = preName
    let data = fs.readFileSync(fileName, 'utf-8')

    processFileData(data, preName)

    setFileName()
}


function processFileData(data, preName) {
    data = data.split('\r\n')
    assembleOut += parser(data, preName)
}

function init() {
    assembleOut = '@256\r\n'
                + 'D=A\r\n'
                + '@SP\r\n' 
                + 'M=D\r\n'
                + '@300\r\n'
                + 'D=A\r\n'
                + '@LOCAL\r\n' 
                + 'M=D\r\n'
                + '@400\r\n'
                + 'D=A\r\n'
                + '@ARGUMENT\r\n' 
                + 'M=D\r\n'
                + '@3000\r\n'
                + 'D=A\r\n'
                + '@THIS\r\n' 
                + 'M=D\r\n'
                + '@3010\r\n'
                + 'D=A\r\n'
                + '@THAT\r\n' 
                + 'M=D\r\n'
}   

function setFileName() {
    fs.writeFile(outputFileName + '.asm', assembleOut, (err) => {
        if (err) {
            throw err
        }
    })
}