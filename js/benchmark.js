const { performance } = require('node:perf_hooks');

const file = process.argv[2]
if (!file) {
    console.error('Please provide a file')
    process.exit(1)
}


const { serialize, deserialize } = require(file)

const warmupReps = 100_000
const measurementReps = 1_000_000


// Serialization

for (let i = 0; i < warmupReps; i++) serialize()

const serializationStart = performance.now()
for (let i = 0; i < measurementReps; i++) serialize()
const serializationTime = performance.now() - serializationStart

console.log('Serialization took', serializationTime / measurementReps, "ms on average")


// Deserialization

const buffer = serialize()

for (let i = 0; i < warmupReps; i++) deserialize(buffer)

const deserializationStart = performance.now()
for (let i = 0; i < measurementReps; i++) deserialize(buffer)
const deserializationTime = performance.now() - deserializationStart

console.log('Deserialization took', deserializationTime / measurementReps, "ms on average")