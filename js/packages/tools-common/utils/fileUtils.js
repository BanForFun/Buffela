const fs = require('node:fs')
const process = require('node:process')
const path = require('node:path')

/**
 * Checks if a directory exists at the given path
 * @param {string} path
 * @returns {boolean}
 */
function existsDirSync(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory()
}

/**
 * @param {string} outputPath
 * @param {string} defaultName
 * @returns {NodeJS.WritableStream}
 */
function getFileOutputStream(outputPath, defaultName) {
    if (!outputPath) return process.stdout

    if (existsDirSync(outputPath))
        outputPath = path.join(outputPath, defaultName)

    return fs.createWriteStream(outputPath)
}

module.exports = {
    getFileOutputStream,
    existsDirSync
}