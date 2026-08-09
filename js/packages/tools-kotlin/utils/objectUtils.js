function isEmpty(object) {
    // noinspection LoopStatementThatDoesntLoopJS
    for (const _ in object) {
        return false
    }

    return true
}

module.exports = { isEmpty }