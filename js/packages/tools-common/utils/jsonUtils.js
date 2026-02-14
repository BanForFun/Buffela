function getJsonPathComponents(path) {
    return path
        .split('/')
        .slice(1)
        // Replace escape sequences (paths are additionally URL encoded, but we shouldn't run into such characters)
        .map(c => c.replace('~1', '/').replace('~0', '~'));
}

module.exports = { getJsonPathComponents }