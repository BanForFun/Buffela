package gr.elaevents.buffela.serialization

interface Serializable {
    fun serialize(buffer: SerializerBuffer): Unit
}

fun Serializable.serialize(): ByteArray {
    val buffer = SerializerBuffer()
    this.serialize(buffer)
    return buffer.toByteArray()
}