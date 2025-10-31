const lengthTypes = {
    "UByte": "number",
    "UShort": "number",
    "UInt": "number",
    "ULong": "BigInt",
}

const primitiveTypes = {
    ...lengthTypes,
    "String": "string",
    "Boolean": "boolean",
    "Byte": "number",
    "Short": "number",
    "Int": "number",
    "Long": "BigInt",
    "Float": "number",
    "Double": "number"
}

const arrayTypes = {
    "UByteArray": "Uint8Array",
    "UShortArray": "Uint16Array",
    "UIntArray": "Uint32Array",
    "ULongArray": "BigUint64Array",
    "BooleanArray": "Uint8ClampedArray",
    "ByteArray": "Int8Array",
    "ShortArray": "Int16Array",
    "IntArray": "Int32Array",
    "LongArray": "BigInt64Array",
    "FloatArray": "Float32Array",
    "DoubleArray": "Float64Array",
    "Buffer": "Buffer"
}

const schemaTypes = { ...primitiveTypes, ...arrayTypes }

/**
 * @type {{ [K in keyof typeof schemaTypes]: number }}
 */
const schemaTypeIndices = {};

let count = 0;
for (const name in schemaTypes) {
    schemaTypeIndices[name] = count++;
}

module.exports = {
    lengthTypes: Object.keys(lengthTypes),
    arrayTypes: Object.keys(arrayTypes),
    schemaTypes: Object.keys(schemaTypes),
    typescriptTypes: Object.values(schemaTypes),
    schemaTypeIndices,
    typeType: "Type"
}