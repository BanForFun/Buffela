package gr.elaevents.buffela.examples

import gr.elaevents.buffela.deserialization.deserialize
import gr.elaevents.buffela.examples.authToken.AuthTokenPayload
import gr.elaevents.buffela.serialization.serialize
import kotlin.system.measureTimeMillis

private const val warmupReps = 100_000
private const val measurementReps = 10_000_000

private val serialized = payload.serialize()

private fun serialize() {
    payload.serialize()
}

private fun deserialize() {
    AuthTokenPayload.deserialize(serialized)
}

private fun printMeasuredTime(action: String, timeMs: Long) {
    val repTime = (timeMs.toDouble() / measurementReps).toBigDecimal()
    println("$action took ${repTime.toPlainString()} ms on average")
}

fun main() {
    for (i in 0..warmupReps) serialize()

    val serializationTimeMs = measureTimeMillis {
        for (i in 0..measurementReps) serialize()
    }

    printMeasuredTime("Serialization", serializationTimeMs)


    for (i in 0..warmupReps) deserialize()

    val deserializationTimeMs = measureTimeMillis {
        for (i in 0..measurementReps) deserialize()
    }

    printMeasuredTime("Deserialization", deserializationTimeMs)

}