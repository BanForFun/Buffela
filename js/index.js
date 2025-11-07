const { performance } = require('node:perf_hooks');

const { parseBuffelaSchema } = require('@buffela/parser')
const { serializeCalf } = require('@buffela/serializer')
const { deserializeCalf } = require('@buffela/deserializer')

const sampleBuffela = require('./sampleBuffela.json')

/**
 * @type {import('./sampleBuffela').schema}
 */
const buffela = parseBuffelaSchema(sampleBuffela)

const testData = {
    expiration: 1000,
    signature: Buffer.alloc(32),
    payload: {
        userId: Buffer.alloc(16),

        role: buffela.TokenPayload.Registered,
        gender: buffela.Gender.FEMALE,
        hobbies: ["coffee", "going out"],

        with: buffela.TokenPayload.Registered.Phone,
        phone: "This is my phone"
    }
}

const serializationStartTime = performance.now()
const buffer = serializeCalf(buffela.Token, testData)
const serializationEndTime = performance.now()

console.log(buffer.toString('hex').match(/../g).join(' '))
console.log('Serialized', buffer.byteLength, 'bytes in', serializationEndTime - serializationStartTime, 'milliseconds')

const deserializationStartTime = performance.now()
const deserialized = deserializeCalf(buffela.Token, buffer)
const deserializationEndTime = performance.now()

console.log(deserialized)
console.log('Deserialized in', deserializationEndTime - deserializationStartTime, 'milliseconds')