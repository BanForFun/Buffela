const { parseSchema } = require('@buffela/parser')
const { registerSerializer, SerializerBuffer} = require('@buffela/serializer')
// const { registerDeserializer, DeserializerBuffer} = require("@buffela/deserializer");

const sampleBuffela = require('./sampleBuffela.json')

/**
 * @type {import('./sampleBuffela').default}
 */
const schema = parseSchema(sampleBuffela)

registerSerializer(schema, {
    Date: {
        serialize(buffer, value) {
            let result = 0

            result = (value.year - 1) * 12 + (value.month - 1)

            result <<= 5
            result |= (value.day - 1)

            buffer.writeUInt(result)
        }
    }
})

// registerDeserializer(schema, {
//     Date: {
//         deserialize(buffer) {
//             let date = buffer.readUInt()
//
//             const dayMask = 1 << 5 - 1
//             const day = date & dayMask
//
//             date >>>= 5
//             const yearMonth = date
//
//             return {
//                 year: Math.floor(yearMonth / 12) + 1,
//                 month: yearMonth % 12 + 1,
//                 day: day + 1
//             }
//         }
//     }
// })

function sha256(buffer) {
    return Buffer.alloc(32)
}

const serializerBuffer = new SerializerBuffer()

schema.AuthTokenPayload.serialize({
    issuedAt: {
        year: 2026,
        month: 12,
        day: 12
    },
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        gender: schema.Gender.MALE,
        User_type: schema.User.Anonymous,
        // User_type: schema.User.Registered,
        // phone: "1234567890"
    }
}, serializerBuffer)

schema.AuthTokenSignature.serialize({
    sha256: sha256(serializerBuffer.toBuffer())
}, serializerBuffer)

const serialized = serializerBuffer.toBuffer()

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(serialized.toString('hex').match(/../g).join(' '))

// const deserializerBuffer = new DeserializerBuffer(serialized)
//
// const payload = schema.AuthTokenPayload.deserialize(deserializerBuffer)
//
// const signature = schema.AuthTokenSignature.deserialize(deserializerBuffer)


//
// console.log()
// const deserialized = deserializeCalf(buffela.AuthToken, buffer)
// console.log('Deserialized', deserialized)