function oneOf(...patterns) {
    return `(${patterns.join('|')})`
}

function anchored(pattern) {
    return `^${pattern}$`
}

function excludeAhead(superPattern, ...excludePatterns) {
    const excludePrefix = excludePatterns.map(p => `(?!${p}$)`).join('')
    return excludePrefix + superPattern
}

function excludeBehind(superPattern, ...excludePatterns) {
    const excludeSuffix = excludePatterns.map(p => `(?<!^${p})`).join('')
    return superPattern + excludeSuffix
}

module.exports = {
    oneOf,
    anchored,
    excludeAhead,
    excludeBehind
}