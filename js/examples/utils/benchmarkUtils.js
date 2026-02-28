const { performance } = require('node:perf_hooks');

const warmupReps = 100_000
const measurementReps = 1_000_000

function benchmark(label, action) {
    for (let i = 0; i < warmupReps; i++) action()

    const startTimeMs = performance.now()
    for (let i = 0; i < measurementReps; i++) action()
    const endTimeMs = performance.now()

    const repTimeMs = (endTimeMs - startTimeMs) / measurementReps
    console.log(`${label} took ${repTimeMs}ms on average`)
}

module.exports = { benchmark }