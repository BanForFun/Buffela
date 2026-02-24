const { schema, payload } = require('./common')

function serialize() {
    return schema.AuthTokenPayload.serialize(payload)
}

function deserialize(serialized) {
    return schema.AuthTokenPayload.deserialize(serialized)
}

module.exports = {
    serialize,
    deserialize
}