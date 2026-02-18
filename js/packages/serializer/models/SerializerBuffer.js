import { SmartBuffer } from 'smart-buffer';

class SerializerBuffer {
    #buffer = new SmartBuffer()

    get offset() {
        return this.#buffer.writeOffset
    }

    set offset(offset) {
        this.#buffer.writeOffset = offset
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
        return this.#buffer.toBuffer()
    }
}

export default SerializerBuffer