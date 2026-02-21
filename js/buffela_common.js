const { parseSchema } = require('@buffela/parser')
const { registerSerializer } = require('@buffela/serializer')
const { registerDeserializer } = require("@buffela/deserializer");

const sampleBuffela = require('./sampleBuffela.json')

/**
 * @type {import('./sampleBuffela').default}
 */
const schema = parseSchema(sampleBuffela)

registerSerializer(schema, {
    Date: {
        serialize(buffer, value) {
            const yearMonth = (value.year - 1) * 12 + (value.month - 1)
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
                year: Math.floor(yearMonth / 12) + 1,
                month: yearMonth % 12 + 1,
                day: day + 1
            }
        }
    }
})

/**
 * @type {import('./sampleBuffela').AuthTokenPayload}
 */
const payload = {
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        User_type: schema.User.Registered,
        vector: [true, true, false, true, true, true, false, true],
        Registered_type: schema.User.Registered.Viewer,
        birthDate: { year: 2003, month: 7, day: 22 },
        countryCode: 30,
        phone: "1234567890",
        gender: schema.Gender.MALE
    }
}

/**
 *
 * @param {Buffer} payloadBytes
 * @returns {import('./sampleBuffela').AuthTokenSignature}
 */
function calculateSignature(payloadBytes) {
    return {
        sha256: Buffer.alloc(32)
    }
}

/**
 *
 * @param {Buffer} payloadBytes
 * @param {import('./sampleBuffela').AuthTokenSignature} signature
 * @returns {boolean}
 */
function verifySignature(payloadBytes, signature) {
    return true
}

module.exports = {
    schema,
    payload,
    calculateSignature,
    verifySignature
};