function oneOf(...patterns) {
    return `(${patterns.join('|')})`
}

function anchored(pattern) {
    return `^${pattern}$`
}

function exclude(superPattern, excludePattern) {
    return `(?!${excludePattern}$)${superPattern}`
}

module.exports = {
    oneOf,
    anchored,
    exclude
}