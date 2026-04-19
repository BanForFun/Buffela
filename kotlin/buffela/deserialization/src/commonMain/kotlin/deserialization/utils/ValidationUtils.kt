package gr.elaevents.buffela.deserialization.utils

fun invalidSubtype(index: Int): Nothing {
    throw IllegalStateException("Invalid subtype index $index")
}