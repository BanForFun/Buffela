/**
 *
 * @param {SerializerBuffer} buffer
 * @param {boolean} value
 */
function serializeBoolean(buffer, value) {
    buffer.writeUByte(value ? 1 : 0)
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {string} value
 * @param {number | null} arg
 */
function serializeString(buffer, value, arg) {
    if (typeof arg === 'number') {
        if (value.length !== arg)
            throw new Error(`Expected length '${arg}' (got '${value.length}')`)

        buffer.writeString(value)
    } else if (arg === null) {
        buffer.writeStringNt(value)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {number} size
 * @param {number | Serializer} arg
 */
export function writeSize(buffer, size, arg) {
    if (typeof arg === 'number' && size !== arg) {
        throw new Error(`Expected size '${arg}' (got '${size}')`)
    } else if (typeof arg === 'object') {
        arg._serialize(buffer, size, null)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {TypedArray} value
 * @param {number | Serializer} arg
 */
function serializeTypedArray(buffer, value, arg) {
    writeSize(buffer, value.length, arg);
    buffer.writeBuffer(Buffer.from(value))
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {Buffer} value
 * @param {number | Serializer} arg
 */
function serializeBuffer(buffer, value, arg) {
    writeSize(buffer, value.length, arg);
    buffer.writeBuffer(value)
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
    Boolean: serializeBoolean,
    Buffer: serializeBuffer,
    String: serializeString,
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
    BooleanArray: serializeTypedArray,
}

export const standardNames = new Set(Object.keys(standardSerializers))