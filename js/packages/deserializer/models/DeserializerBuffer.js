import { SmartBuffer } from 'smart-buffer';

export default class DeserializerBuffer {
    #buffer

    #bitBuffer = 0
    #bitCount = 0

    get position() {
        return this.#buffer.readOffset
    }

    constructor(buffer) {
        this.#buffer = SmartBuffer.fromBuffer(buffer)
    }

    #loadBits() {
        this.#bitBuffer = this.#buffer.readUInt8()
        this.#bitCount = 8
    }

    #readLSBits(bitLength) {
        const mask = (1 << bitLength) - 1
        const value = this.#bitBuffer & mask

        this.#bitCount -= bitLength
        this.#bitBuffer >>= bitLength

        return value
    }

    readUnsigned(bitLength) {
        let result = 0
        let totalRead = 0

        while (totalRead < bitLength) {
            if (this.#bitCount === 0) this.#loadBits()

            const readLength = Math.min(this.#bitCount, bitLength - totalRead)
            const lsb = this.#readLSBits(readLength)
            const shifted = lsb << totalRead

            result |= shifted
            totalRead += readLength
        }

        return result
    }

    readSigned(bitLength) {
        let result = this.readUnsigned(bitLength)

        const prefixLength = 32 - bitLength
        result <<= prefixLength
        result >>= prefixLength

        return result;
    }

    readByte() {
        return this.#buffer.readInt8()
    }

    readUByte() {
        return this.#buffer.readUInt8()
    }

    readShort() {
        return this.#buffer.readInt16LE()
    }

    readUShort() {
        return this.#buffer.readUInt16LE()
    }

    readInt() {
        return this.#buffer.readInt32LE()
    }

    readUInt() {
        return this.#buffer.readUInt32LE()
    }

    readLong() {
        return this.#buffer.readBigInt64LE()
    }

    readULong() {
        return this.#buffer.readBigUInt64LE()
    }

    readFloat() {
        return this.#buffer.readFloatLE()
    }

    readDouble() {
        return this.#buffer.readDoubleLE()
    }

    readBoolean() {
        return !!this.readUnsigned(1)
    }

    readBuffer(length) {
        return this.#buffer.readBuffer(length)
    }

    readString(length = 0) {
        return length ? this.#buffer.readString(length) : this.#buffer.readStringNT()
    }
}