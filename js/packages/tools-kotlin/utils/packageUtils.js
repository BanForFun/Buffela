const path = require("node:path")

/**
 *
 * @param {string} dirPath
 * @return {string}
 */
function autoDetectPackage(dirPath) {
    const resolvedPath = path.resolve(dirPath)
    const segments = resolvedPath.split(path.sep)

    const kotlinSegmentIndex = segments.lastIndexOf('kotlin')
    if (kotlinSegmentIndex === -1) return ""

    return segments.slice(kotlinSegmentIndex + 1).join('.')
}


module.exports = {
    autoDetectPackage
}