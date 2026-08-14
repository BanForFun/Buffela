const fs = require("node:fs");
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
 * Returns the nested directory of rootDirPath that filePath is in.
 * Returns empty string if filePath is not inside rootDirPath.
 * @param {string} filePath
 * @param {string} [rootDirPath]
 * @returns {string}
 */
function getNestedDirPath(filePath, rootDirPath) {
    const dirPath = path.dirname(filePath)
    const relativeDirPath = path.relative(rootDirPath, dirPath)
    if (relativeDirPath.startsWith("..")) return ""

    return relativeDirPath
}

/**
 * @typedef {object} FileLocation
 * @property {string} inputFile
 * @property {string} outputRootDir
 * @property {string} outputSubDir
 */

/**
 * Reads a text file if it exists
 * @param {string} filePath
 * @param {BufferEncoding} [encoding]
 * @returns {string | null}
 */
function tryReadFileSync(filePath, encoding = "utf8") {
    try {
        return fs.readFileSync(filePath, encoding);
    } catch(err) {
        if (err.code === 'ENOENT')
            return null;
        else
            throw err;
    }
}

/**
 *
 * @param {string[]} rootDirPaths
 * @param {string} inputExpr
 * @param {boolean} watch
 * @param {(fileLocation: FileLocation) => void} callback
 * @returns {Promise<void>}
 */
async function processFiles(rootDirPaths, inputExpr, watch, callback) {
    /*
    Note: The callback is deliberately synchronous so that the console output doesn't get mixed between root directories
     */

    if (watch) {
        let watcherPaths
        let watcherConfig

        if (inputExpr.startsWith("*")) {
            const extension = inputExpr.substring(1)
            watcherPaths = rootDirPaths
            watcherConfig = {
                ignored: (file, stats) => stats?.isFile() && !file.endsWith(extension)
            }
        } else {
            watcherPaths = rootDirPaths.map(dirPath => path.join(dirPath, inputExpr))
            watcherConfig = {}
        }

        const watchers = []
        const handleError = (error) => {
            console.error(error)

            for (const watcher of watchers) {
                watcher.close()
            }
        }

        for (let i = 0; i < watcherPaths.length; i++) {
            const watcher = chokidar.watch(watcherPaths[i], watcherConfig)
            watchers[i] = watcher

            const rootDirPath = rootDirPaths[i]
            const absoluteRootDirPath = path.resolve(rootDirPath)

            const handleAddOrChange = (filePath) => {
                callback({
                    inputFile: filePath,
                    outputRootDir: rootDirPath,
                    outputSubDir: getNestedDirPath(filePath, absoluteRootDirPath)
                })
            }

            watcher
                .on("add", handleAddOrChange)
                .on("change", handleAddOrChange)
                .on("error", handleError)
        }
    } else {
        if (inputExpr.startsWith("*")) {
            const extension = inputExpr.substring(1)
            for (const rootDirPath of rootDirPaths) {
                const absoluteRootDirPath = path.resolve(rootDirPath)

                for await (const entry of readdirp(rootDirPath, {
                    fileFilter: file => file.basename.endsWith(extension)
                })) {
                    callback({
                        inputFile: path.join(rootDirPath, entry.path),
                        outputRootDir: rootDirPath,
                        outputSubDir: getNestedDirPath(entry.fullPath, absoluteRootDirPath)
                    })
                }
            }
        } else {
            for (const rootDirPath of rootDirPaths) {
                const absoluteRootDirPath = path.resolve(rootDirPath)

                const inputPath = path.join(rootDirPath, inputExpr)
                const stats = fs.statSync(inputPath)
                if (stats.isDirectory()) {
                    for await (const entry of readdirp(inputPath)) {
                        callback({
                            inputFile: path.join(inputPath, entry.path),
                            outputRootDir: rootDirPath,
                            outputSubDir: getNestedDirPath(entry.fullPath, absoluteRootDirPath)
                        })
                    }
                } else {
                    callback({
                        inputFile: inputPath,
                        outputRootDir: rootDirPath,
                        outputSubDir: getNestedDirPath(inputPath, absoluteRootDirPath)
                    })
                }
            }
        }
    }
}

module.exports = {
    existsDirSync,
    processFiles,
    tryReadFileSync
}