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

const optConstSizeTypes = [
    "String",
    "Int",
    "UInt"
]

const varSizeTypes = [
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
    optConstSizeTypes,
    varSizeTypes,
    fixedSizeTypes
}