const protobuf = require("protobufjs");
const path = require("node:path");
const {sign, assertSigned} = require("../utils/signatureUtils");
const {prettyBuffer, prettyObject} = require("../utils/formatUtils");

// Setup ===============================================================================================================

const root = protobuf.loadSync(path.join(__dirname, "AuthToken.proto"));

const AuthTokenPayload = root.lookupType("auth.AuthTokenPayload");
const AuthToken = root.lookupType("auth.AuthToken");

// Serialization =======================================================================================================

const payload = {
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        registered: {
            verified: true,
            viewer: {
                birthDate: "2003-07-22",
                countryCode: 30,
                phone: "1234567890",
                gender: 1
            }
        }
    }
}

const serialized = AuthToken.encode(AuthToken.create({
    payload,
    signature: {
        hmac256: sign(AuthTokenPayload.encode(AuthTokenPayload.create(payload)).finish())
    }
})).finish();

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(prettyBuffer(serialized))

// Deserialization =====================================================================================================

const deserialized = AuthToken.toObject(AuthToken.decode(serialized))
console.log("Auth token payload:", prettyObject(deserialized.payload));

const serializedPayload = AuthTokenPayload.encode(AuthTokenPayload.create(deserialized.payload)).finish();
assertSigned(serializedPayload, deserialized.signature.hmac256)

console.log('Signature is valid')