const { parseSchema } = require('@buffela/parser')
const { registerSerializer, SerializerBuffer } = require('@buffela/serializer')
const { registerDeserializer } = require("@buffela/deserializer");

const sampleBuffela = require('./sampleBuffela.json')

/**
 * @type {import('./sampleBuffela').default}
 */
const schema = parseSchema(sampleBuffela)
//
registerDeserializer(schema, {
    Date: {
        deserialize(buffer) {

        }
    }
})
//
// schema.User.serialize()

schema.User.deserialize()

registerSerializer(schema, {
   Date: {
        serialize(value, buffer) {

        }
   }
})

schema.User.serialize()




// console.log()
// const buffer = serializeCalf(buffela.AuthToken, {
//     issuedAt: Date.now(),
//     signature: Buffer.alloc(32),
//     user: {
//         userId: "d6c47b4b-6983-48eb-a957-a954798f6e57",
//         gender: buffela.Gender.FEMALE,
//         hobbies: ["coffee", "reading", "going out"],
//         registeredWith: buffela.User.RegisteredWithPhone,
//         countryCode: 30,
//         phone: "691 234 5678"
//     }
// })
// console.log('Serialized', buffer.byteLength, 'bytes')
// console.log(buffer.toString('hex').match(/../g).join(' '))
//
// console.log()
// const deserialized = deserializeCalf(buffela.AuthToken, buffer)
// console.log('Deserialized', deserialized)