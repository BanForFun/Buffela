const { SerializerBuffer } = require('@buffela/serializer')
const { DeserializerBuffer } = require("@buffela/deserializer");
const { schema, payload } = require('./buffela_common')
const { sign, verify } = require("./signatureUtils");
const { prettyBuffer, prettyObject } = require("./formatUtils");

const serializerBuffer = new SerializerBuffer()

schema.AuthTokenPayload.serialize(payload, serializerBuffer)
schema.AuthTokenSignature.serialize({
    sha256: sign(serializerBuffer.toBuffer())
}, serializerBuffer)

const serialized = serializerBuffer.toBuffer()

console.log('Serialized', serialized.length, 'bytes')
console.log(prettyBuffer(serialized))

const deserializerBuffer = new DeserializerBuffer(serialized)

const deserializedPayload = schema.AuthTokenPayload.deserialize(deserializerBuffer)
console.log('Deserialized payload:', prettyObject(deserializedPayload))

const serializedPayload = serialized.subarray(0, deserializerBuffer.position)
const deserializedSignature = schema.AuthTokenSignature.deserialize(deserializerBuffer)
verify(serializedPayload, deserializedSignature.sha256)

console.log('Signature is valid')