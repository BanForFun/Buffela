const { SerializerBuffer } = require('@buffela/serializer')
const { DeserializerBuffer } = require("@buffela/deserializer");
const { schema, payload, calculateSignature } = require('./common')

const serializerBuffer = new SerializerBuffer()

schema.AuthTokenPayload.serialize(payload, serializerBuffer)

schema.AuthTokenSignature.serialize(calculateSignature(serializerBuffer.toBuffer()), serializerBuffer)

const serialized = serializerBuffer.toBuffer()

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(serialized.toString('hex').match(/../g).join(' '))

const deserializerBuffer = new DeserializerBuffer(serialized)

const deserializedPayload = schema.AuthTokenPayload.deserialize(deserializerBuffer)
const deserializedSignature = schema.AuthTokenSignature.deserialize(deserializerBuffer)

console.log('Deserialized', deserializedPayload, deserializedSignature)