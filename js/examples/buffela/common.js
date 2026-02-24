const { parseSchema } = require('@buffela/parser')
const { registerSerializer } = require('@buffela/serializer')
const { registerDeserializer } = require("@buffela/deserializer");

const sampleBuffela = require('./AuthToken.json')

/**
 * @type {import('./AuthToken').default}
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
 * @type {import('./AuthToken').AuthTokenPayload}
 */
const payload = {
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        User_type: schema.User.Registered,
        verified: true,
        Registered_type: schema.User.Registered.Viewer,
        birthDate: { year: 2003, month: 7, day: 22 },
        countryCode: 30,
        phone: "1234567890",
        gender: schema.Gender.MALE
    }
}

module.exports = {
    schema,
    payload
};