const { AuthTokenPayload, AuthToken, payload } = require('./common')
const { sign, verify } = require("../utils/signatureUtils");
const { prettyBuffer, prettyObject } = require("../utils/formatUtils");

const token = {
    payload,
    signature: {
        sha256: sign(AuthTokenPayload.encode(AuthTokenPayload.create(payload)).finish())
    }
}

const serialized = AuthToken.encode(AuthToken.create(token)).finish();

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(prettyBuffer(serialized))

const deserialized = AuthToken.toObject(AuthToken.decode(serialized))
const serializedPayload = AuthTokenPayload.encode(AuthTokenPayload.create(deserialized.payload)).finish();

console.log("Deserialized payload", prettyObject(deserialized.payload));

verify(serializedPayload, deserialized.signature.sha256)
