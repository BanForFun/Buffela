const nativeTypes = require("../constants/nativeTypes");

function printDeserializerAliases() {
    printer.line('typealias _Deserializer<T> = gr.elaevents.buffela.deserialization.Deserializer<T>')
    printer.line('typealias _DeserializerBuffer = gr.elaevents.buffela.deserialization.DeserializerBuffer')
}

/**
 *
 * @param {string} primitive
 * @param {...string} args
 * @returns {string}
 */
function deserializePrimitive(primitive, ...args) {
    return `buffer.read${primitive}(${args.join(', ')})`
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @returns {number|string}
 */
function deserializeSize(type) {
    const { element } = type
    if (typeof element !== 'object') return element

    let extension = ""
    switch (element.name) {
        case 'UByte':
        case 'UShort':
        case 'Unsigned':
            extension = ".toInt()"
            break;
    }

    return deserializeElement(type) + extension
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} itemPrimitive
 * @returns {string}
 */
function deserializePrimitiveArray(type, itemPrimitive) {
    const size = deserializeSize(type.argument)
    return `${nativeTypes[type.element.name]}(${size}) { _ -> ${deserializePrimitive(itemPrimitive)} }`
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 */
function deserializeElement(type) {
    const { element, argument } = type

    switch(element.name) {
        case 'ByteArray':
            return deserializePrimitiveArray(type, 'Byte')
        case 'UByteArray':
            return deserializePrimitiveArray(type, 'UByte')
        case 'ShortArray':
            return deserializePrimitiveArray(type, 'Short')
        case 'UShortArray':
            return deserializePrimitiveArray(type, 'UShort')
        case 'IntArray':
            return deserializePrimitiveArray(type, 'Int')
        case 'UIntArray':
            return deserializePrimitiveArray(type, 'UInt')
        case 'LongArray':
            return deserializePrimitiveArray(type, 'Long')
        case 'ULongArray':
            return deserializePrimitiveArray(type, 'ULong')
        case 'FloatArray':
            return deserializePrimitiveArray(type, 'Float')
        case 'DoubleArray':
            return deserializePrimitiveArray(type, 'Double')
        case 'BooleanArray':
            return deserializePrimitiveArray(type, 'Boolean')
        case 'Bytes':
            return `buffer.readBytes(${deserializeSize(argument)})`
        case 'Signed':
        case 'Unsigned':
            return deserializePrimitive(element.name, argument.element.toString())
        case 'String':
            if (argument) {
                return `buffer.readString(${deserializeSize(argument)})`
            } else {
                return deserializePrimitive(element.name)
            }
        default:
            if (element.kind === 'primitive') {
                return deserializePrimitive(element.name)
            } else {
                return `${element.name}.deserialize(buffer)`
            }
    }
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {number} dimension
 */
function deserializeNotNullField(type, dimension) {
    if (dimension === 0) {
        return deserializeElement(type)
    }

    const sizeType = type.dimensions[dimension - 1]
    const size = deserializeSize(sizeType)
    return `Array(${size}) { _ -> ${deserializeField(type,dimension - 1)} }`
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {number} dimension
 */
function deserializeField(type, dimension = type.dimensions?.length) {
    const isArray = dimension > 0
    const optional = isArray ? type.dimensions[dimension - 1].optional : type.optional

    if (optional) {
        return `if (buffer.readBoolean()) ${deserializeNotNullField(type, dimension)} else null`
    } else {
        return deserializeNotNullField(type, dimension)
    }
}

module.exports = {
    printDeserializerAliases,
    deserializeSize,
    deserializeField
}