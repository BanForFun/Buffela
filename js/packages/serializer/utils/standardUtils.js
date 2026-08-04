import { serializeSize } from "./typeUtils.js";

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {string} value
 * @param {SerializerTypes.InstantiatedConstSizeType | null} sizeType
 */
function serializeString(buffer, value, sizeType) {
    if (sizeType === null) {
        buffer.writeString(value)
        buffer.writeByte(0)
    } else {
        if (value.length !== sizeType.element)
            throw new Error(`Expected length '${sizeType.element}' (got '${value.length}')`)

        buffer.writeString(value)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {number} value
 * @param {SerializerTypes.InstantiatedConstSizeType | null} sizeType
 */
function serializeInt(buffer, value, sizeType) {
    buffer.writeInt(value, sizeType?.element)
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {number} value
 * @param {SerializerTypes.InstantiatedConstSizeType | null} sizeType
 */
function serializeUInt(buffer, value, sizeType) {
    buffer.writeUInt(value, sizeType?.element)
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {TypedArray} value
 * @param {SerializerTypes.InstantiatedSizeType} sizeType
 */
function serializeTypedArray(buffer, value, sizeType) {
    serializeSize(buffer, sizeType, value.length);
    buffer.writeBytes(Buffer.from(value.buffer))
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {boolean[]} values
 * @param {SerializerTypes.InstantiatedSizeType} sizeType
 */
function serializeBooleanArray(buffer, values, sizeType) {
    serializeSize(buffer, sizeType, values.length);
    for (const bool of values) {
        buffer.writeBoolean(bool)
    }
}

/**
 *
 * @type {Object.<string, SerializeCallback>}
 */
export const nullarySerializers = {
    Byte: (buffer, value) => buffer.writeByte(value),
    UByte: (buffer, value) => buffer.writeUByte(value),
    Short: (buffer, value) => buffer.writeShort(value),
    UShort: (buffer, value) => buffer.writeUShort(value),
    Long: (buffer, value) => buffer.writeLong(value),
    ULong: (buffer, value) => buffer.writeULong(value),
    Float: (buffer, value) => buffer.writeFloat(value),
    Double: (buffer, value) => buffer.writeDouble(value),
    Boolean: (buffer, value) => buffer.writeBoolean(value),
}

/**
 *
 * @type {Object.<string, SerializeCallback>}
 */
export const variadicSerializers = {
    Int: serializeInt,
    UInt: serializeUInt,
    String: serializeString,
}

/**
 *
 * @type {Object.<string, SerializeCallback>}
 */
export const unarySerializers = {
    Bytes: serializeTypedArray,
    ByteArray: serializeTypedArray,
    UByteArray: serializeTypedArray,
    ShortArray: serializeTypedArray,
    UShortArray: serializeTypedArray,
    IntArray: serializeTypedArray,
    UIntArray: serializeTypedArray,
    LongArray: serializeTypedArray,
    ULongArray: serializeTypedArray,
    FloatArray: serializeTypedArray,
    DoubleArray: serializeTypedArray,
    BooleanArray: serializeBooleanArray,
}