import { deserializeSize } from "./typeUtils.js";

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedConstSizeType | null} arg
 * @returns {string}
 */
function deserializeString(buffer, arg) {
    return buffer.readString(arg?.element)
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedConstSizeType | null} arg
 * @returns {number}
 */
function deserializeInt(buffer, arg) {
    return buffer.readInt(arg?.element)
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedConstSizeType | null} arg
 * @returns {number}
 */
function deserializerUInt(buffer, arg) {
    return buffer.readUInt(arg?.element)
}

/**
 *
 * @param {{ new (buffer: Buffer): TypedArray, BYTES_PER_ELEMENT: number }} Constructor
 * @returns {DeserializeCallback}
 */
function typedArrayDeserializer(Constructor) {
    return (buffer, arg) => {
        const size = deserializeSize(buffer, arg)
        return new Constructor(buffer.readBytes(size * Constructor.BYTES_PER_ELEMENT))
    }
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedSizeType} arg
 * @returns {boolean[]}
 */
function deserializeBooleanArray(buffer, arg) {
    const size = deserializeSize(buffer, arg)
    return Array.from({ length: size }, () => buffer.readBoolean())
}

/**
 *
 * @type {Object.<string, DeserializeCallback>}
 */
export const nullaryDeserializers = {
    Byte: (buffer) => buffer.readByte(),
    UByte: (buffer) => buffer.readUByte(),
    Short: (buffer) => buffer.readShort(),
    UShort: (buffer) => buffer.readUShort(),
    Long: (buffer) => buffer.readLong(),
    ULong: (buffer) => buffer.readULong(),
    Float: (buffer) => buffer.readFloat(),
    Double: (buffer) => buffer.readDouble(),
    Boolean: (buffer) => buffer.readBoolean(),
}

/**
 *
 * @type {Object.<string, DeserializeCallback>}
 */
export const variadicDeserializers = {
    String: deserializeString,
    Int: deserializeInt,
    UInt: deserializerUInt,
}

/**
 *
 * @type {Object.<string, DeserializeCallback>}
 */
export const unaryDeserializers = {
    Bytes: typedArrayDeserializer(Uint8Array),
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