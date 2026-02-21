const {
    AuthTokenPayload,
    AuthToken,
    payload,
    calculateSignature
} = require('./proto_common')

const payloadBytes = AuthTokenPayload.encode(AuthTokenPayload.create(payload)).finish();

const token = {
    payload,
    signature: calculateSignature(payloadBytes)
}

const serialized = AuthToken.encode(AuthToken.create(token)).finish();

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(serialized.toString('hex').match(/../g).join(' '))

const deserialized = AuthToken.toObject(AuthToken.decode(serialized))

console.log(JSON.stringify(deserialized, null, 2))
