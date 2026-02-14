const sizeTypes = [
    "UByte",
    "UShort",
    "Int",
]

const hybridTypes = [
    "String",
]

const arrayTypes = [
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

const primitiveTypes = [
    ...sizeTypes,
    "Boolean",
    "Byte",
    "Short",
    "Long",
    "Float",
    "Double",
    "UInt",
    "ULong",
]

module.exports = {
    sizeTypes,
    hybridTypes,
    arrayTypes,
    primitiveTypes
}