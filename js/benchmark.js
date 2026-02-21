const { performance } = require('node:perf_hooks');

const file = process.argv[2]
if (!file) {
    console.error('Please provide a file')
    process.exit(1)
}


const { serialize, deserialize } = require(file)

const warmUpReps = 10_000
const measurementReps = 1_000_000

for (let i = 0; i < warmUpReps; i++) {
    serialize()
}

const serializationStart = performance.now()
for (let i = 0; i < measurementReps; i++) {
    serialize()
}

const serializationTime = performance.now() - serializationStart
console.log('Serialization took an average of', serializationTime / measurementReps, "ms")


const buffer = serialize()

for (let i = 0; i < warmUpReps; i++) {
    deserialize(buffer)
}

const deserializationStart = performance.now()
for (let i = 0; i < measurementReps; i++) {
    deserialize(buffer)
}

const deserializationTime = performance.now() - deserializationStart
console.log('Deserialization took an average of', deserializationTime / measurementReps, "ms")