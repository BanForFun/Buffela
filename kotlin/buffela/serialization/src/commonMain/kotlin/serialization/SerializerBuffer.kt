package gr.elaevents.buffela.serialization

import gr.elaevents.buffela.utils.LinkedList
import kotlinx.io.Buffer
import kotlinx.io.readByteArray
import kotlinx.io.writeDoubleLe
import kotlinx.io.writeIntLe
import kotlinx.io.writeLongLe
import kotlinx.io.writeShortLe
import kotlinx.io.writeString
import kotlinx.io.writeUByte
import kotlinx.io.writeUIntLe
import kotlinx.io.writeULongLe
import kotlinx.io.writeUShortLe

private data class BitChunk(val offset: Int, var buffer: Byte = 0) {
    fun apply(bytes: ByteArray) {
        bytes[offset] = buffer
    }
}

class SerializerBuffer {
    private val buffer = Buffer()
    private val bitChunks = LinkedList<BitChunk>()

    private var bitChunk: BitChunk? = null
    private var bitBuffer: Int = 0
    private var bitCount = 0

    val length get() = buffer.size.toInt()

    private fun flushBits() {
        if (this.bitCount == 0) return
        bitChunk!!.buffer = this.bitBuffer.toByte()
    }

    private fun writeLSBits(value: Int, bitLength: Int) {
        if (this.bitCount == 0) {
            this.bitChunk = BitChunk(this.length)
            bitChunks.append(this.bitChunk!!)

            this.buffer.writeByte(0) // Reserve space
        }

        val mask = (1 shl bitLength) - 1
        val masked = mask and value
        val shifted = masked shl this.bitCount

        this.bitCount += bitLength
        this.bitBuffer = this.bitBuffer or shifted
    }

    private fun writeTruncated(value: Int, bitLength: Int) {
        var remainingValue = value
        var remainingLength = bitLength

        while (remainingLength > 0) {
            val available = 8 - this.bitCount
            if (remainingLength < available) {
                this.writeLSBits(remainingValue, remainingLength)
                break;
            }

            this.writeLSBits(remainingValue, available)
            this.flushBits()
            this.clearBitBuffer()

            remainingValue = remainingValue ushr available
            remainingLength -= available
        }
    }

    fun clearBitBuffer() {
        this.bitCount = 0
        this.bitBuffer = 0
    }

    fun writeSigned(value: Int, bitLength: Int) {
        if (bitLength > 31) throw IllegalArgumentException("Bit fields cannot be larger than 31 bits")

        val minValue = -(1 shl bitLength - 1)
        val maxValue = (1 shl bitLength) - 1

        if (value !in minValue..maxValue)
            throw IllegalArgumentException("Value out of range")

        this.writeTruncated(value, bitLength)
    }

    fun writeUnsigned(value: UInt, bitLength: Int) {
        if (bitLength > 31) throw IllegalArgumentException("Bit fields cannot be larger than 31 bits")

        val maxValue = (1u shl bitLength) - 1u
        if (value !in 0u..maxValue)
            throw IllegalArgumentException("Value out of range")

        this.writeTruncated(value.toInt(), bitLength)
    }

    fun writeByte(byte: Byte) {
        this.buffer.writeByte(byte)
    }

    fun writeUByte(uByte: UByte) {
        this.buffer.writeUByte(uByte)
    }

    fun writeShort(short: Short) {
        this.buffer.writeShortLe(short)
    }

    fun writeUShort(uShort: UShort) {
        this.buffer.writeUShortLe(uShort)
    }

    fun writeInt(int: Int) {
        this.buffer.writeIntLe(int)
    }

    fun writeUInt(uInt: UInt) {
        this.buffer.writeUIntLe(uInt)
    }

    fun writeLong(long: Long) {
        this.buffer.writeLongLe(long)
    }

    fun writeULong(uLong: ULong) {
        this.buffer.writeULongLe(uLong)
    }

    fun writeDouble(double: Double) {
        this.buffer.writeDoubleLe(double)
    }

    fun writeBoolean(boolean: Boolean) {
        this.writeTruncated(if (boolean) 1 else 0, 1)
    }

    fun writeBytes(bytes: ByteArray) {
        this.buffer.write(bytes, 0, bytes.size)
    }

    fun writeString(string: String, nt: Boolean = false) {
        this.buffer.writeString(string)
        if (nt) this.buffer.writeByte(0)
    }

    fun toBytes(): ByteArray {
        this.flushBits()

        // Make copy so that we don't consume the bytes from the buffer
        val bytes = this.buffer.copy().readByteArray()

        for (chunk in this.bitChunks)
            chunk.apply(bytes)

        return bytes
    }
}