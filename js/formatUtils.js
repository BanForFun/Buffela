const { inspect } = require("node:util");

function prettyBuffer(buffer) {
    return buffer.toString('hex').match(/../g).join(' ')
}

function prettyObject(object) {
    return inspect(object, {
        showHidden: false,
        depth: null,
        colors: true
    })
}

module.exports = { prettyBuffer, prettyObject }