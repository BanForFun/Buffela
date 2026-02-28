package gr.elaevents.buffela.examples

fun prettyByteArray(bytes: ByteArray): String {
    return bytes.joinToString(" ") { "%02x".format(it) }
}