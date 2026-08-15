const nativeTypes = require("../constants/nativeTypes");

function printSerializerImports() {
    printer.line('import gr.elaevents.buffela.serialization.utils.assertLength')
    printer.line('import gr.elaevents.buffela.serialization.utils.assertSize')
    printer.line('import gr.elaevents.buffela.serialization.Serializable as _Serializable')
    printer.line('import gr.elaevents.buffela.serialization.SerializerBuffer as _SerializerBuffer')

    for (const name in options.primitives) {
        printer.line(`import ${options.primitives[name]}.write${name}`)
    }
}

/**
 *
 * @param {string} primitive
 * @param {...string} args
 */
function serializePrimitive(primitive, ...args) {
    printer.line(`buffer.write${primitive}(${args.join(', ')})`)
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedSizeType} type
 * @param {string} size
 */
function serializeSize(type, size) {
    const { element } = type
    if (typeof element !== 'object') {
        printer.line(`assertSize(${element}, ${size})`)
        return;
    }

    const nativeType = nativeTypes[element.name];
    const extension = nativeType === "Int" ? "" : `.to${nativeType ?? element.name}()`;

    serializeElement(type, size + extension)
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} arrayName
 * @param {string} itemPrimitive
 */
function serializePrimitiveArray(type, arrayName, itemPrimitive) {
    serializeSize(type.argument, `${arrayName}.size`)

    const itemName = `item0`;
    printer.blockStart(`for (${itemName} in ${arrayName}) {`)
    serializePrimitive(itemPrimitive, itemName)
    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} fieldName
 */
function serializeElement(type, fieldName) {
    const { element, argument } = type

    switch(element.name) {
        case 'ByteArray':
            serializePrimitiveArray(type, fieldName, 'Byte')
            break;
        case 'UByteArray':
            serializePrimitiveArray(type, fieldName, 'UByte')
            break;
        case 'ShortArray':
            serializePrimitiveArray(type, fieldName, 'Short')
            break;
        case 'UShortArray':
            serializePrimitiveArray(type, fieldName, 'UShort')
            break;
        case 'IntArray':
            serializePrimitiveArray(type, fieldName, 'Int')
            break;
        case 'UIntArray':
            serializePrimitiveArray(type, fieldName, 'UInt')
            break;
        case 'LongArray':
            serializePrimitiveArray(type, fieldName, 'Long')
            break;
        case 'ULongArray':
            serializePrimitiveArray(type, fieldName, 'ULong')
            break;
        case 'FloatArray':
            serializePrimitiveArray(type, fieldName, 'Float')
            break;
        case 'DoubleArray':
            serializePrimitiveArray(type, fieldName, 'Double')
            break;
        case 'BooleanArray':
            serializePrimitiveArray(type, fieldName, 'Boolean')
            break;
        case 'Bytes':
            serializeSize(argument, `${fieldName}.size`)
            serializePrimitive(element.name, fieldName)
            break;
        case 'Int':
        case 'UInt':
            if (argument) {
                serializePrimitive(element.name, fieldName, argument.element.toString())
            } else {
                serializePrimitive(element.name, fieldName)
            }
            break;
        case 'String':
            if (argument) {
                printer.line(`assertLength(${argument.element}, ${fieldName}.length)`)
                serializePrimitive(element.name, fieldName)
            } else {
                serializePrimitive(element.name, fieldName)
                serializePrimitive('Byte', '0')
            }
            break;
        default:
            if (element.kind === 'primitive') {
                serializePrimitive(element.name, fieldName)
            } else {
                printer.line(`${fieldName}.serialize(buffer)`)
            }
            break;
    }
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} fieldName
 * @param {number} dimension
 */
function serializeNotNullField(type, fieldName, dimension) {
    if (dimension === 0) {
        serializeElement(type, fieldName)
        return
    }

    const sizeType = type.dimensions[dimension - 1].sizeType
    serializeSize(sizeType, `${fieldName}.size`)

    const itemName = `item${dimension}`;
    printer.blockStart(`for (${itemName} in ${fieldName}) {`)
    serializeField(type, itemName, dimension - 1)
    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} fieldName
 * @param {number} dimension
 */
function serializeField(type, fieldName, dimension = type.dimensions.length) {
    const isArray = dimension > 0
    const optional = isArray ? type.dimensions[dimension - 1].optional : type.optional

    if (optional) {
        printer.line(`buffer.writeBoolean(${fieldName} != null)`)

        printer.blockStart(`${fieldName}?.let {`)
        serializeNotNullField(type, 'it', dimension)
        printer.blockEnd('}')
    } else {
        serializeNotNullField(type, fieldName, dimension)
    }
}

module.exports = {
    printSerializerImports,
    serializeField,
    serializeSize
}