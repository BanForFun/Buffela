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
    if (kotlinSegmentIndex === -1) {
        console.warn('Failed to autodetect package name')
        return ""
    }

    return segments.slice(kotlinSegmentIndex + 1).join('.')
}

/**
 *
 * @param {...string} segments
 * @return {string}
 */
function joinPackageSegments(...segments) {
    return segments.filter(segment => !!segment).join('.')
}


module.exports = {
    autoDetectPackage,
    joinPackageSegments
}