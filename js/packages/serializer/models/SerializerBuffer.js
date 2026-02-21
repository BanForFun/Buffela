import { SmartBuffer } from 'smart-buffer';

class SerializerBuffer {
    #buffer = new SmartBuffer()

    #bitOffset = -1
    #bitBuffer = 0
    #bitCount = 0

    get length() {
        return this.#buffer.length
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
        const shifted = masked << this.#bitCount

        this.#bitCount += bitLength
        this.#bitBuffer |= shifted
    }

    // Will truncate all significant bits above the bitLength
    writeTruncated(value, bitLength) {
        while (bitLength > 0) {
            const available = 8 - this.#bitCount
            if (bitLength < available) {
                this.#writeLSBits(value, bitLength)
                break;
            }

            this.#writeLSBits(value, available)
            this.#flushBits()

            value >>= available
            bitLength -= available
        }
    }

    writeSigned(value, bitLength) {
        // Bit shifts return 32-bit SIGNED integers so we cannot decode 32-bit unsigned values.
        // Technically we could allow 32-bit signed bit fields only, but that would be weird
        // Just use a regular Int/UInt
        if (bitLength > 31) throw new Error('Bit fields cannot be larger that 31 bits')

        // Here we could use bit shifts to calculate the range,
        // but I prefer to stay consistent with the unsigned implementation where we cannot
        const minValue = -Math.pow(2, bitLength - 1)
        const maxValue = Math.pow(2, bitLength - 1) - 1

        if (value < minValue || value > maxValue)
            throw new Error('Value out of range')

        this.writeTruncated(value, bitLength)
    }

    writeUnsigned(value, bitLength) {
        if (bitLength > 31) throw new Error('Bit fields cannot be larger that 31 bits')

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

    writeBuffer(buffer) {
        this.#buffer.writeBuffer(buffer)
    }

    writeString(string) {
        this.#buffer.writeString(string)
    }

    writeNtString(string) {
        this.#buffer.writeStringNT(string)
    }

    toBuffer() {
        this.#flushBits()
        return this.#buffer.toBuffer()
    }
}

export default SerializerBuffer