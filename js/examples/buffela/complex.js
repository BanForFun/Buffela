const { parseSchema } = require('@buffela/parser')
const { registerSerializer, SerializerBuffer } = require('@buffela/serializer')
const { registerDeserializer, DeserializerBuffer } = require('@buffela/deserializer');

const { sign, assertSigned } = require("../utils/signatureUtils");
const { prettyBuffer, prettyObject } = require("../utils/formatUtils");

const schemaJson = require('./AuthToken.json')

// Setup ===============================================================================================================

/** @type {import('./AuthToken').default} */
const schema = parseSchema(schemaJson)

registerSerializer(schema, {
    Date: {
        serialize(buffer, value) {
            const yearMonth = value.year * 12 + (value.month - 1)
            const day = value.day - 1

            buffer.writeUnsigned(yearMonth, 17)
            buffer.writeUnsigned(day, 5)
        }
    }
})

registerDeserializer(schema, {
    Date: {
        deserialize(buffer) {
            const yearMonth = buffer.readUnsigned(17)
            const day = buffer.readUnsigned(5)

            return {
                year: Math.floor(yearMonth / 12),
                month: yearMonth % 12 + 1,
                day: day + 1
            }
        }
    }
})


// Serialization =======================================================================================================

const serializerBuffer = new SerializerBuffer()

schema.AuthTokenPayload.serialize({
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        User_type: schema.User.Registered,
        verified: true,
        Registered_type: schema.User.Registered.Viewer,
        birthDate: { year: 2003, month: 7, day: 22 },
        countryCode: 30,
        phone: '1234567890',
        gender: schema.Gender.MALE
    }
}, serializerBuffer)

serializerBuffer.clearBitBuffer()

schema.AuthTokenSignature.serialize({
    hmac256: sign(serializerBuffer.toBytes())
}, serializerBuffer)

const serialized = serializerBuffer.toBytes()

console.log('Serialized', serialized.length, 'bytes')
console.log(prettyBuffer(serialized))


// Deserialization =====================================================================================================

const deserializerBuffer = new DeserializerBuffer(serialized)

const payload = schema.AuthTokenPayload.deserialize(deserializerBuffer)
console.log('Auth token payload:', prettyObject(payload))

deserializerBuffer.clearBitBuffer()

const payloadBytes = serialized.subarray(0, deserializerBuffer.position)
const signature = schema.AuthTokenSignature.deserialize(deserializerBuffer)
assertSigned(payloadBytes, signature.hmac256)

console.log('Signature is valid')
