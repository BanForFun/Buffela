const { AuthTokenPayload, payload } = require('./common')

function serialize() {
    return AuthTokenPayload.encode(AuthTokenPayload.create(payload)).finish();
}

function deserialize(serialized) {
    return AuthTokenPayload.toObject(AuthTokenPayload.decode(serialized))
}

module.exports = {
    serialize,
    deserialize
}