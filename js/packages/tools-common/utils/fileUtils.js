const fs = require('node:fs')
const process = require('node:process')
const path = require('node:path')

/**
 * @param {string} outputPath
 * @param {string} defaultName
 * @returns {NodeJS.WritableStream}
 */
function getFileOutputStream(outputPath, defaultName) {
    if (!outputPath) return process.stdout

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory())
        outputPath = path.join(outputPath, defaultName)

    return fs.createWriteStream(outputPath)
}

module.exports = {
    getFileOutputStream
}