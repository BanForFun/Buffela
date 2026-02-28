package gr.elaevents.buffela.examples

import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

private const val ALGORITHM = "HmacSHA256"
private const val SECRET = "your-secret-key"

private val secretBytes = SECRET.toByteArray()

fun sign(data: ByteArray): ByteArray {
    val secretKey = SecretKeySpec(secretBytes, ALGORITHM)
    val mac = Mac.getInstance(ALGORITHM)
    mac.init(secretKey)
    return mac.doFinal(data)
}

fun assertSigned(data: ByteArray, expectedHmac: ByteArray) {
    val actualHmac = sign(data)
    if (!MessageDigest.isEqual(actualHmac, expectedHmac))
        throw IllegalStateException("Invalid signature")
}