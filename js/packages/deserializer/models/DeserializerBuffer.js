import { SmartBuffer } from 'smart-buffer';

export default class DeserializerBuffer {
    #buffer
    length

    #bitBuffer = 0
    #bitCount = 0

    get position() {
        return this.#buffer.readOffset
    }

    constructor(bytes) {
        this.#buffer = SmartBuffer.fromBuffer(Buffer.from(bytes))
        this.length = bytes.byteLength
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

    alignToByte() {
        this.#bitCount = 0
    }

    readUInt(bitLength = null) {
        if (bitLength == null) {
            return this.#buffer.readUInt32LE();
        } else {
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
    }

    readInt(bitLength = null) {
        if (bitLength == null) {
            return this.#buffer.readInt32LE();
        } else {
            let result = this.readUInt(bitLength)

            const prefixLength = 32 - bitLength
            result <<= prefixLength
            result >>= prefixLength

            return result;
        }
    }

    readBoolean() {
        return !!this.readUInt(1)
    }

    readString(length = null) {
        return length != null
            ? this.#buffer.readString(length)
            : this.#buffer.readStringNT()
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

    readBytes(length) {
        return this.#buffer.readBuffer(length)
    }
}