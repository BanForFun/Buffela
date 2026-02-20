import { SmartBuffer } from 'smart-buffer';

class SerializerBuffer {
    #buffer = new SmartBuffer()

    #bitOffset = -1
    #bitBuffer = 0
    #bitCount = 0

    get offset() {
        return this.#buffer.writeOffset
    }

    set offset(offset) {
        this.#buffer.writeOffset = offset
    }

    #flushBits() {
        if (this.#bitCount === 0) return

        this.#buffer.writeUInt8(this.#bitBuffer, this.#bitOffset)
        this.#bitCount = 0
        this.#bitBuffer = 0
    }

    #writeLSBits(value, bitLength) {
        if (this.#bitCount === 0) {
            // Reserve space
            this.#bitOffset = this.#buffer.writeOffset
            this.#buffer.writeUInt8(0)
        }

        const mask = (1 << bitLength) - 1
        const masked = value & mask

        this.#bitCount += bitLength
        this.#bitBuffer <<= bitLength
        this.#bitBuffer |= masked
    }

    // Will truncate all significant bits above the bitLength
    writeTruncated(value, bitLength) {
        while (bitLength > 0) {
            const available = 8 - this.#bitCount
            if (bitLength < available) {
                this.#writeLSBits(value, bitLength)
                return;
            }

            this.#writeLSBits(value, available)
            this.#flushBits()

            value >>= available
            bitLength -= available
        }
    }

    writeSigned(value, bitLength) {
        if (bitLength > 32) throw new Error('Bit fields cannot be larger that 32 bits')

        const minValue = -Math.pow(2, bitLength - 1)
        const maxValue = Math.pow(2, bitLength - 1) - 1

        if (value < minValue || value > maxValue)
            throw new Error('Value out of range')

        this.writeTruncated(value, bitLength)
    }

    writeUnsigned(value, bitLength) {
        if (bitLength > 32) throw new Error('Bit fields cannot be larger that 32 bits')

        const maxValue = Math.pow(2, bitLength) - 1

        if (value < 0 || value > maxValue)
            throw new Error('Value out of range')

        this.writeTruncated(value, bitLength)
    }

    writeByte(byte) {
        this.#buffer.writeInt8(byte)
    }

    writeUByte(uByte) {
        this.#buffer.writeUInt8(uByte)
    }

    writeShort(short) {
        this.#buffer.writeInt16LE(short)
    }

    writeUShort(uShort) {
        this.#buffer.writeUInt16LE(uShort)
    }

    writeInt(int) {
        this.#buffer.writeInt32LE(int)
    }

    writeUInt(uInt) {
        this.#buffer.writeUInt32LE(uInt)
    }

    writeLong(long) {
        this.#buffer.writeBigInt64LE(long)
    }

    writeULong(uLong) {
        this.#buffer.writeBigUInt64LE(uLong)
    }

    writeFloat(float) {
        this.#buffer.writeFloatLE(float)
    }

    writeDouble(double) {
        this.#buffer.writeDoubleLE(double)
    }

    writeString(string) {
        this.#buffer.writeString(string)
    }

    writeStringNt(string) {
        this.#buffer.writeStringNT(string)
    }

    writeBuffer(buffer) {
        this.#buffer.writeBuffer(buffer)
    }

    toBuffer() {
        this.#flushBits()
        return this.#buffer.toBuffer()
    }
}

export default SerializerBuffer