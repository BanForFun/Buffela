const {
    AuthTokenPayload,
    AuthToken,
    payload,
    calculateSignature
} = require('./proto_common')

function serialize() {
    const payloadBytes = AuthTokenPayload.encode(AuthTokenPayload.create(payload)).finish();

    const token = {
        payload,
        signature: calculateSignature(payloadBytes)
    }

    return AuthToken.encode(AuthToken.create(token)).finish();
}

function deserialize(serialized) {
    return AuthToken.toObject(AuthToken.decode(serialized))
}

module.exports = {
    serialize, deserialize
}