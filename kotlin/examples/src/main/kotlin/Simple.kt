package gr.elaevents.buffela.examples

import gr.elaevents.buffela.deserialization.DeserializerBuffer
import gr.elaevents.buffela.examples.authToken.AuthTokenPayload
import gr.elaevents.buffela.examples.authToken.AuthTokenSignature
import gr.elaevents.buffela.serialization.SerializerBuffer

fun main() {
    val serializerBuffer = SerializerBuffer()

    payload.serialize(serializerBuffer)

    AuthTokenSignature(
        sha256 = sign(serializerBuffer.toByteArray())
    ).serialize(serializerBuffer)

    val serialized = serializerBuffer.toByteArray()

    println("Serialized ${serialized.size} bytes")
    println(prettyByteArray(serialized))

    val deserializerBuffer = DeserializerBuffer(serialized)

    val deserializedPayload = AuthTokenPayload.deserialize(deserializerBuffer)
    println("Deserialized payload: $deserializedPayload")

    val serializedPayload = serialized.sliceArray(0 until deserializerBuffer.position)
    val deserializedSignature = AuthTokenSignature.deserialize(deserializerBuffer)
    verify(serializedPayload, deserializedSignature.sha256)

    println("Signature is valid")
}