package gr.elaevents.buffela.deserialization

import kotlinx.io.Buffer
import kotlinx.io.indexOf
import kotlinx.io.readByteArray
import kotlinx.io.readDoubleLe
import kotlinx.io.readIntLe
import kotlinx.io.readLongLe
import kotlinx.io.readShortLe
import kotlinx.io.readString
import kotlinx.io.readUByte
import kotlinx.io.readUIntLe
import kotlinx.io.readULongLe
import kotlinx.io.readUShortLe
import kotlin.math.min

class DeserializerBuffer(byteArray: ByteArray) {
    private val buffer: Buffer = Buffer().apply { write(byteArray) }

    val position get() = buffer.size

    private var bitBuffer: Int = 0
    private var bitCount = 0

    private fun loadBits() {
        this.bitBuffer = this.buffer.readByte().toInt()
        this.bitCount = 8
    }

    private fun readLSBits(bitLength: Int): Int {
        val mask = (1 shl bitLength) - 1
        val value = this.bitBuffer and mask

        this.bitCount -= bitLength
        this.bitBuffer = this.bitBuffer ushr bitLength

        return value
    }

    private fun readTruncated(bitLength: Int): Int {
        var result = 0
        var totalRead = 0

        while (totalRead < bitLength) {
            if (this.bitCount == 0) this.loadBits()

            val readLength = min(this.bitCount, bitLength - totalRead)
            val lsb = this.readLSBits(readLength)
            val shifted = lsb shl totalRead

            result = result or shifted
            totalRead += readLength
        }

        return result
    }

    fun clearBitBuffer() {
        this.bitCount = 0
    }

    fun readUnsigned(bitLength: Int): UInt {
        return readTruncated(bitLength).toUInt()
    }

    fun readSigned(bitLength: Int): Int {
        val result = readTruncated(bitLength)
        val prefixLength = 32 - bitLength
        return (result shl prefixLength) shr prefixLength
    }

    fun readByte(): Byte {
        return this.buffer.readByte()
    }

    fun readUByte(): UByte {
        return this.buffer.readUByte()
    }

    fun readShort(): Short {
        return this.buffer.readShortLe()
    }

    fun readUShort(): UShort {
        return this.buffer.readUShortLe()
    }

    fun readInt(): Int {
        return this.buffer.readIntLe()
    }

    fun readUInt(): UInt {
        return this.buffer.readUIntLe()
    }

    fun readLong(): Long {
        return this.buffer.readLongLe()
    }

    fun readULong(): ULong {
        return this.buffer.readULongLe()
    }

    fun readDouble(): Double {
        return this.buffer.readDoubleLe()
    }

    fun readBoolean(): Boolean {
        return this.readTruncated(1) == 1
    }

    fun readByteArray(length: Int): ByteArray {
        return this.buffer.readByteArray(length)
    }

    fun readString(): String {
        with(this.buffer) {
            val length = indexOf(0)
            val string = readString(length)
            skip(1)

            return string
        }
    }

    fun readString(length: Long): String {
        return this.buffer.readString(length)
    }
}