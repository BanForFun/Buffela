import {deserializeValue} from "./typeUtils.js";

/**
 *
 * @param {DeserializerBuffer} buffer
 * @returns {boolean}
 */
function deserializeBoolean(buffer) {
    return !!buffer.readUnsigned(1)
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType | null} arg
 * @returns {string}
 */
function deserializeString(buffer, arg) {
    if (arg === null) {
        return buffer.readStringNt()
    } else if (typeof arg.element === 'number') {
        return buffer.readString(arg.element)
    }
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType} arg
 * @returns {Buffer}
 */
function deserializeBuffer(buffer, arg) {
    const size = deserializeValue(buffer, arg)
    return buffer.readBuffer(size)
}

/**
 *
 * @param {{ new (buffer: Buffer): TypedArray, BYTES_PER_ELEMENT: number }} Constructor
 * @returns {Deserialize}
 */
function typedArrayDeserializer(Constructor) {
    return (buffer, arg) => {
        const size = deserializeValue(buffer, arg)
        return new Constructor(buffer.readBuffer(size * Constructor.BYTES_PER_ELEMENT))
    }
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType} arg
 * @returns {boolean[]}
 */
function deserializeBooleanArray(buffer, arg) {
    const size = deserializeValue(buffer, arg)
    return Array.from({ length: size }, () => deserializeBoolean(buffer))
}

/**
 *
 * @type {Object.<string, Deserialize>}
 */
export const standardDeserializers = {
    Byte: (buffer) => buffer.readByte(),
    UByte: (buffer) => buffer.readUByte(),
    Short: (buffer) => buffer.readShort(),
    UShort: (buffer) => buffer.readUShort(),
    Int: (buffer) => buffer.readInt(),
    UInt: (buffer) => buffer.readUInt(),
    Long: (buffer) => buffer.readLong(),
    ULong: (buffer) => buffer.readULong(),
    Float: (buffer) => buffer.readFloat(),
    Double: (buffer) => buffer.readDouble(),
    Signed: (buffer, arg) => buffer.readSigned(arg.element),
    Unsigned: (buffer, arg) => buffer.readUnsigned(arg.element),
    Boolean: deserializeBoolean,
    String: deserializeString,
    Buffer: deserializeBuffer,
    ByteArray: typedArrayDeserializer(Int8Array),
    UByteArray: typedArrayDeserializer(Uint8Array),
    ShortArray: typedArrayDeserializer(Int16Array),
    UShortArray: typedArrayDeserializer(Uint16Array),
    IntArray: typedArrayDeserializer(Int32Array),
    UIntArray: typedArrayDeserializer(Uint32Array),
    LongArray: typedArrayDeserializer(BigInt64Array),
    ULongArray: typedArrayDeserializer(BigUint64Array),
    FloatArray: typedArrayDeserializer(Float32Array),
    DoubleArray: typedArrayDeserializer(Float64Array),
    BooleanArray: deserializeBooleanArray,
}

export const standardNames = new Set(Object.keys(standardDeserializers))