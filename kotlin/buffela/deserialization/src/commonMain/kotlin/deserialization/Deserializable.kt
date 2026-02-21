package gr.elaevents.buffela.deserialization

interface Deserializable<T> {
    fun deserialize(buffer: DeserializerBuffer): T
}

fun <T> Deserializable<T>.deserialize(bytes: ByteArray): T {
    val buffer = DeserializerBuffer(bytes)
    return this.deserialize(buffer)
}