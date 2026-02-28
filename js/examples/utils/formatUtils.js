const { inspect } = require("node:util");

/**
 *
 * @param {Buffer} buffer
 * @returns {string}
 */
function prettyBuffer(buffer) {
    return buffer.toString('hex').match(/../g).join(' ')
}

/**
 *
 * @param {Object} object
 * @returns {string}
 */
function prettyObject(object) {
    return inspect(object, {
        showHidden: false,
        depth: null,
        colors: true
    })
}

module.exports = { prettyBuffer, prettyObject }