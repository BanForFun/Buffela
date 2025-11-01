const { performance } = require('node:perf_hooks');

const readBuffalo = require('./buffaloReader')
const serializeBuffalo = require('./buffaloSerializer')
const deserializeBuffalo = require('./buffaloDeserializer')

/**
 * @type {import('./testBuffalo.d.ts').testBuffalo}
 */
const testBuffalo = readBuffalo('testBuffalo.yaml')

const testData = {
    expiration: 3,
    signature: Buffer.alloc(32),
    payload: {
        userId: Buffer.alloc(16),

        role: testBuffalo.TokenPayload.Registered,
        gender: testBuffalo.Gender.FEMALE,
        hobbies: ["coffee", "going out"],

        with: testBuffalo.TokenPayload.Registered.Phone,
        phone: "This is my phone"
    }
}

const startTime = performance.now()
const buffer = serializeBuffalo(testBuffalo.Token, testData)
const endTime = performance.now()

console.log(buffer.toString('hex').match(/../g).join(' '))
console.log('Serialized', buffer.byteLength, 'bytes in', endTime - startTime, 'milliseconds')

const deserialized = deserializeBuffalo(testBuffalo.Token, buffer)
console.log(deserialized)