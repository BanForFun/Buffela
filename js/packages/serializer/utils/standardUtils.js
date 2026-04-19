import {serializeValue} from "./typeUtils.js";

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {string} value
 * @param {Serializer.InstantiatedType | null} sizeType
 */
function serializeString(buffer, value, sizeType) {
    if (sizeType === null) {
        buffer.writeString(value, true)
    } else {
        serializeValue(buffer, sizeType, value.length);
        buffer.writeString(value)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {TypedArray} value
 * @param {Serializer.InstantiatedType} sizeType
 */
function serializeTypedArray(buffer, value, sizeType) {
    serializeValue(buffer, sizeType, value.length);
    buffer.writeBytes(Buffer.from(value.buffer))
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {boolean[]} values
 * @param {Serializer.InstantiatedType} sizeType
 */
function serializeBooleanArray(buffer, values, sizeType) {
    serializeValue(buffer, sizeType, values.length);
    for (const bool of values) {
        buffer.writeBoolean(bool)
    }
}

/**
 *
 * @type {Object.<string, Serialize>}
 */
export const standardSerializers = {
    Byte: (buffer, value) => buffer.writeByte(value),
    UByte: (buffer, value) => buffer.writeUByte(value),
    Short: (buffer, value) => buffer.writeShort(value),
    UShort: (buffer, value) => buffer.writeUShort(value),
    Int: (buffer, value) => buffer.writeInt(value),
    UInt: (buffer, value) => buffer.writeUInt(value),
    Long: (buffer, value) => buffer.writeLong(value),
    ULong: (buffer, value) => buffer.writeULong(value),
    Float: (buffer, value) => buffer.writeFloat(value),
    Double: (buffer, value) => buffer.writeDouble(value),
    Boolean: (buffer, value) => buffer.writeBoolean(value),
    Signed: (buffer, value, arg) => buffer.writeSigned(value, arg.element),
    Unsigned: (buffer, value, arg) => buffer.writeUnsigned(value, arg.element),
    String: serializeString,
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

export const standardNames = new Set(Object.keys(standardSerializers))