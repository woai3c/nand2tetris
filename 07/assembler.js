const fs = require('fs')
const parser = require('./parser')

const fileName = process.argv[2]
const isDirectory = fs.lstatSync(fileName).isDirectory()

if (isDirectory) {
    fs.readdir(fileName, (err, files) => {
        if (err) {
            throw err
        }

        files.forEach(file => {
            readFile(file, processFileData)
        })
    })
} else {
    readFile(fileName, processFileData)
}


function readFile(file, callback) {
    fs.readFile(file, 'utf-8', callback)
}

function processFileData(err, data) {
    if (err) {
        throw err
    }

    data = split('\r\n')
    parser(data)
}