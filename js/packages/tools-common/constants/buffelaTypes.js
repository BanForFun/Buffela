const scalarTypes = [
    "UByte",
    "UShort",
    "Int",
    "Boolean",
    "Byte",
    "Short",
    "Long",
    "Float",
    "Double",
    "UInt",
    "ULong",
]

const sentinelTypes = [
    "String",
]

const sizedTypes = [
    "UByteArray",
    "UShortArray",
    "UIntArray",
    "ULongArray",
    "BooleanArray",
    "ByteArray",
    "ShortArray",
    "IntArray",
    "LongArray",
    "FloatArray",
    "DoubleArray",
    "Buffer",
]

const constSizedTypes = [
    "Signed",
    "Unsigned"
]

module.exports = {
    sentinelTypes,
    constSizedTypes,
    sizedTypes,
    scalarTypes
}