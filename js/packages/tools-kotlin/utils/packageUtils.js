const path = require("node:path")

/**
 *
 * @param {string} filePath
 * @return {string}
 */
function autoDetectPackage(filePath) {
    const resolvedPath = path.resolve(filePath)
    const segments = resolvedPath.split(path.sep)

    const kotlinSegmentIndex = segments.lastIndexOf('kotlin')
    if (kotlinSegmentIndex === -1) return ""

    return segments.slice(kotlinSegmentIndex + 1, -1).join('.')
}


module.exports = {
    autoDetectPackage
}