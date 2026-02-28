package gr.elaevents.buffela.examples

import gr.elaevents.buffela.deserialization.DeserializerBuffer
import gr.elaevents.buffela.examples.authToken.AuthTokenPayload
import gr.elaevents.buffela.examples.authToken.AuthTokenSignature
import gr.elaevents.buffela.examples.authToken.Date
import gr.elaevents.buffela.examples.authToken.Gender
import gr.elaevents.buffela.examples.authToken.User
import gr.elaevents.buffela.serialization.SerializerBuffer

fun main() {
    // Serialization ===================================================================================================

    val serializerBuffer = SerializerBuffer()

    val payload = AuthTokenPayload(
        issuedAt = System.currentTimeMillis().toDouble(),
        user = User.Registered.Viewer(
            userId = "588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11",
            verified = true,
            birthDate = Date(
                year = 2003,
                month = 7,
                day = 22
            ),
            countryCode = 30u,
            phone = "1234567890",
            gender = Gender.MALE
        )
    )

    payload.serialize(serializerBuffer)

    serializerBuffer.clearBitBuffer()

    val signature = AuthTokenSignature(hmac256 = sign(serializerBuffer.toBytes()))
    signature.serialize(serializerBuffer)

    val serialized = serializerBuffer.toBytes()
    println("Serialized ${serialized.size} bytes")
    println(prettyByteArray(serialized))

    // Deserialization =================================================================================================

    val deserializerBuffer = DeserializerBuffer(serialized)

    val deserializedPayload = AuthTokenPayload.deserialize(deserializerBuffer)
    println("Deserialized payload: $deserializedPayload")

    deserializerBuffer.clearBitBuffer()

    val serializedPayload = serialized.sliceArray(0 until deserializerBuffer.position)
    val deserializedSignature = AuthTokenSignature.deserialize(deserializerBuffer)
    assertSigned(serializedPayload, deserializedSignature.hmac256)

    println("Signature is valid")
}