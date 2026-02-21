const {
    payload,
} = require('./proto_common')

const serialized = Buffer.from(JSON.stringify(payload), 'utf8')

console.log('Serialized', serialized.byteLength, 'bytes')
console.log(serialized.toString('hex').match(/../g).join(' '))

const deserialized = JSON.parse(serialized.toString())

console.log(JSON.stringify(deserialized, null, 2))
