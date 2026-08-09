package gr.elaevents.buffela.serialization.utils

fun assertSize(expected: Int, actual: Int) {
    if (expected != actual) throw IllegalStateException("Expected size $expected, got $actual")
}

fun assertLength(expected: Int, actual: Int) {
    if (expected != actual) throw IllegalStateException("Expected length $expected, got $actual")
}