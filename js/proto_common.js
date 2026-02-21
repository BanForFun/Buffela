const protobuf = require("protobufjs");

const root = protobuf.loadSync("sample.proto");

const AuthTokenPayload = root.lookupType("auth.AuthTokenPayload");
const AuthToken = root.lookupType("auth.AuthToken");

const payload = {
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        registered: {
            vector: [true, true, false, true, true, true, false, true],
            viewer: {
                birthDate: "2003-07-22",
                countryCode: 30,
                phone: "1234567890",
                gender: 1
            }
        }
    }
};

function calculateSignature(payloadBytes) {
    return {
        sha256: Buffer.alloc(32)
    }
}

function verifySignature(payloadBytes, signature) {
    return true
}

module.exports = {
    AuthTokenPayload,
    AuthToken,
    payload,
    calculateSignature,
    verifySignature,
}
