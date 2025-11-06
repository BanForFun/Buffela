const { performance } = require('node:perf_hooks');

const readBuffela = require('./packages/parser/utils/buffelaParser')
const serializeBuffela = require('./packages/serializer/utils/calfSerializer')
const deserializeBuffela = require('./packages/deserializer/utils/calfDeserializer')

/**
 * @type {import('./buffela').buffela}
 */
const buffela = readBuffela('../buffela.yaml')

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
const buffer = serializeBuffela(buffela.Token, testData)
const serializationEndTime = performance.now()

console.log(buffer.toString('hex').match(/../g).join(' '))
console.log('Serialized', buffer.byteLength, 'bytes in', serializationEndTime - serializationStartTime, 'milliseconds')

const deserializationStartTime = performance.now()
const deserialized = deserializeBuffela(buffela.Token, buffer)
const deserializationEndTime = performance.now()

console.log(deserialized)
console.log('Deserialized in', deserializationEndTime - deserializationStartTime, 'milliseconds')