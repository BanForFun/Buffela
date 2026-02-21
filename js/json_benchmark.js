const { payload } = require('./proto_common')

function serialize() {
    return JSON.stringify(payload)
}

function deserialize(serialized) {
    return JSON.parse(serialized)
}

module.exports = {
    serialize, deserialize
}