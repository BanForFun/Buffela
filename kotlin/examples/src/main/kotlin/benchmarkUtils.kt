package gr.elaevents.buffela.examples

import kotlin.system.measureTimeMillis

private const val warmupReps = 100_000
private const val measurementReps = 10_000_000

fun benchmark(label: String, action: () -> Unit) {
    for (i in 0..warmupReps) action()

    val totalTimeMs = measureTimeMillis { for (i in 0..measurementReps) action() }
    val repTimeMs = (totalTimeMs.toDouble() / measurementReps).toBigDecimal()
    println("$label took ${repTimeMs.toPlainString()} ms on average")
}