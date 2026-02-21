const { SerializerBuffer } = require('@buffela/serializer')
const { DeserializerBuffer } = require("@buffela/deserializer");
const { schema, payload, calculateSignature } = require('./buffela_common')

function serialize() {
    const buffer = new SerializerBuffer()
    schema.AuthTokenPayload.serialize(payload, buffer)
    schema.AuthTokenSignature.serialize(calculateSignature(buffer.toBuffer()), buffer)

    return buffer.toBuffer()
}

function deserialize(serialized) {
    const buffer = new DeserializerBuffer(serialized)

    return {
        payload: schema.AuthTokenPayload.deserialize(buffer),
        signature: schema.AuthTokenSignature.deserialize(buffer)
    }
}

module.exports = {
    serialize, deserialize
}