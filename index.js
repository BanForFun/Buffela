const readBuffalo = require('./buffaloReader')
const serializeBuffalo = require('./buffaloSerializer')

/**
 * @type {import('./testBuffalo.d.ts').testBuffalo}
 */
const testBuffalo = readBuffalo('testBuffalo.yaml')


const buffer = serializeBuffalo(testBuffalo.Token, {
    expiration: Date.now(),
    signature: Buffer.alloc(32),
    payload: {
        userId: Buffer.alloc(16),

        role: testBuffalo.TokenPayload.Registered,
        gender: testBuffalo.Gender.FEMALE,
        hobbies: ["coffee", "going out"],

        with: testBuffalo.TokenPayload.Registered.Phone,
        phone: "This is my phone"
    }
})


console.log(buffer, buffer.byteLength)