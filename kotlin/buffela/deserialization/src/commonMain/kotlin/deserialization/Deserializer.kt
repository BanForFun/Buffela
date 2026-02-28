package gr.elaevents.buffela.deserialization

interface Deserializer<T> {
    fun deserialize(buffer: DeserializerBuffer): T
}

fun <T> Deserializer<T>.deserialize(bytes: ByteArray): T {
    val buffer = DeserializerBuffer(bytes)
    return this.deserialize(buffer)
}