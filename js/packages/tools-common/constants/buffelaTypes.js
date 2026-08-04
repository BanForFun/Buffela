const fixedSizeTypes = [
    "UByte",
    "UShort",
    "Boolean",
    "Byte",
    "Short",
    "Long",
    "Float",
    "Double",
    "ULong",
]

const sentinelTypes = [
    "String",
    "Int",
    "UInt"
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
    "Bytes",
]

module.exports = {
    sentinelTypes,
    sizedTypes,
    fixedSizeTypes
}