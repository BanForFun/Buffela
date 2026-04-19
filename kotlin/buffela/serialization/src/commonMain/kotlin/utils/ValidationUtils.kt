package gr.elaevents.buffela.utils

fun assertLength(expected: Int, actual: Int) {
    if (expected != actual) throw IllegalStateException("Expected length $expected, got $actual")
}