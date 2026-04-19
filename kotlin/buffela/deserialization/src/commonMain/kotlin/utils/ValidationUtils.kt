package gr.elaevents.buffela.utils

fun invalidSubtype(index: Int): Nothing {
    throw IllegalStateException("Invalid subtype index $index")
}