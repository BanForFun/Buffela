const fs = require('node:fs')
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
 * @returns {string}
 */
function resolveOutputFilePath(outputPath, defaultName) {
    if (!outputPath) return ""

    if (existsDirSync(outputPath))
        return path.join(outputPath, defaultName)

    return outputPath
}

module.exports = {
    resolveOutputFilePath,
    existsDirSync
}