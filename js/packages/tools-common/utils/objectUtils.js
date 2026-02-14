/**
 * Checks if an object or array is empty
 * @param {object} object
 * @returns {boolean}
 */
function isEmpty(object) {
    // noinspection LoopStatementThatDoesntLoopJS
    for (let _ in object) {
        return false;
    }

    return true;
}

module.exports = { isEmpty }