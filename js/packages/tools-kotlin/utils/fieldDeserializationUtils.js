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
    if (typeof element === "number") return element

    let extension = ""
    switch (element.name) {
        case 'UByte':
        case 'UShort':
        case 'Unsigned':
            extension = ".toInt()"
            break;
    }

    return deserializeField(type) + extension
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {string} itemPrimitive
 * @returns {string}
 */
function deserializeArray(type, itemPrimitive) {
    const size = deserializeSize(type.argument)
    return `${nativeTypes[type.element.name]}(${size}) { _ -> ${deserializePrimitive(itemPrimitive)} }`
}


/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {number} dimension
 */
function deserializeField(type, dimension = type.dimensions?.length) {
    if (dimension > 0) {
        const sizeType = type.dimensions[dimension - 1]
        const size = deserializeSize(sizeType)
        return `Array(${size}) { _ -> ${deserializeField(type,dimension - 1)} }`
    }

    const { element, argument } = type
    switch(element.name) {
        case 'ByteArray':
            return deserializeArray(type, 'Byte')
        case 'UByteArray':
            return deserializeArray(type, 'UByte')
        case 'ShortArray':
            return deserializeArray(type, 'Short')
        case 'UShortArray':
            return deserializeArray(type, 'UShort')
        case 'IntArray':
            return deserializeArray(type, 'Int')
        case 'UIntArray':
            return deserializeArray(type, 'UInt')
        case 'LongArray':
            return deserializeArray(type, 'Long')
        case 'ULongArray':
            return deserializeArray(type, 'ULong')
        case 'FloatArray':
            return deserializeArray(type, 'Float')
        case 'DoubleArray':
            return deserializeArray(type, 'Double')
        case 'BooleanArray':
            return deserializeArray(type, 'Boolean')
        case 'Bytes':
            const size = deserializeSize(argument)
            return `buffer.readBytes(${size})`
        case 'Signed':
        case 'Unsigned':
            return deserializePrimitive(element.name, argument.element.toString())
        case 'String':
            if (argument) {
                return `buffer.readString(${argument.element})`
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

module.exports = {
    printDeserializerAliases,
    deserializeSize,
    deserializeField
}