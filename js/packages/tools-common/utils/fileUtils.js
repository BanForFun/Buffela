const fs = require('node:fs');
const path = require("node:path");

const { readdirp } = require("readdirp");
const chokidar = require("chokidar");

/**
 * Checks if a directory exists at the given path
 * @param {string} path
 * @returns {boolean}
 */
function existsDirSync(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory()
}

/**
 *
 * @param {string} filePath
 * @param {string} [relativeTo]
 * @returns {string}
 */
function getNestedDirPath(filePath, relativeTo = "") {
    const dirPath = path.dirname(path.resolve(filePath))
    const relativeDirPath = path.relative(relativeTo, dirPath)
    if (relativeDirPath.startsWith("..")) return ""

    return relativeDirPath
}

/**
 *
 * @param {string} inputExpr
 * @param {boolean} watch
 * @param {(filePath: String) => void} callback
 * @returns {Promise<void>}
 */
async function processFiles(inputExpr, watch, callback) {
    if (watch) {
        let watcher;
        if (inputExpr.startsWith("*")) {
            const extension = inputExpr.substring(1)
            watcher = chokidar.watch(".", {
                ignored: (file, stats) => stats?.isFile() && !file.endsWith(extension)
            })
        } else {
            watcher = chokidar.watch(inputExpr)
        }

        watcher
            .on("add", (path) => callback(path))
            .on("change", (path) => callback(path))
            .on("error", (error) => console.error(error))

    } else {
        if (inputExpr.startsWith("*")) {
            const extension = inputExpr.substring(1)
            for await (const entry of readdirp(".", {
                fileFilter: file => file.basename.endsWith(extension)
            })) {
                callback(entry.path)
            }
        } else {
            const stats = fs.statSync(inputExpr)
            if (stats.isDirectory()) {
                for await (const entry of readdirp(inputExpr)) {
                    callback(entry.fullPath)
                }
            } else {
                callback(inputExpr)
            }
        }
    }
}

module.exports = { existsDirSync, processFiles, getNestedDirPath }