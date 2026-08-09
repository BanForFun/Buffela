const nativeTypes = require("../constants/nativeTypes");

function printSerializerImports() {
    printer.line('import gr.elaevents.buffela.serialization.utils.assertLength')
    printer.line('import gr.elaevents.buffela.serialization.utils.assertSize')
    printer.line('import gr.elaevents.buffela.serialization.Serializable as _Serializable')
    printer.line('import gr.elaevents.buffela.serialization.SerializerBuffer as _SerializerBuffer')
}

/**
 *
 * @param {string} primitive
 * @param {...string} args
 */
function printSerializePrimitive(primitive, ...args) {
    printer.line(`buffer.write${primitive}(${args.join(', ')})`)
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedSizeType} type
 * @param {string} size
 */
function printSerializeSize(type, size) {
    const { element } = type
    if (typeof element !== 'object') {
        printer.line(`assertSize(${element}, ${size})`)
        return;
    }

    const nativeType = nativeTypes[element.name];
    const extension = nativeType === "Int" ? "" : `.to${nativeType ?? element.name}()`;

    printSerializeElement(type, size + extension)
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} arrayName
 * @param {string} itemPrimitive
 */
function printSerializePrimitiveArray(type, arrayName, itemPrimitive) {
    printSerializeSize(type.argument, `${arrayName}.size`)

    const itemName = `item0`;
    printer.blockStart(`for (${itemName} in ${arrayName}) {`)
    printSerializePrimitive(itemPrimitive, itemName)
    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} fieldName
 */
function printSerializeElement(type, fieldName) {
    const { element, argument } = type

    switch(element.name) {
        case 'ByteArray':
            printSerializePrimitiveArray(type, fieldName, 'Byte')
            break;
        case 'UByteArray':
            printSerializePrimitiveArray(type, fieldName, 'UByte')
            break;
        case 'ShortArray':
            printSerializePrimitiveArray(type, fieldName, 'Short')
            break;
        case 'UShortArray':
            printSerializePrimitiveArray(type, fieldName, 'UShort')
            break;
        case 'IntArray':
            printSerializePrimitiveArray(type, fieldName, 'Int')
            break;
        case 'UIntArray':
            printSerializePrimitiveArray(type, fieldName, 'UInt')
            break;
        case 'LongArray':
            printSerializePrimitiveArray(type, fieldName, 'Long')
            break;
        case 'ULongArray':
            printSerializePrimitiveArray(type, fieldName, 'ULong')
            break;
        case 'FloatArray':
            printSerializePrimitiveArray(type, fieldName, 'Float')
            break;
        case 'DoubleArray':
            printSerializePrimitiveArray(type, fieldName, 'Double')
            break;
        case 'BooleanArray':
            printSerializePrimitiveArray(type, fieldName, 'Boolean')
            break;
        case 'Bytes':
            printSerializeSize(argument, `${fieldName}.size`)
            printSerializePrimitive(element.name, fieldName)
            break;
        case 'Int':
        case 'UInt':
            if (argument) {
                printSerializePrimitive(element.name, fieldName, argument.element.toString())
            } else {
                printSerializePrimitive(element.name, fieldName)
            }
            break;
        case 'String':
            if (argument) {
                printer.line(`assertLength(${argument.element}, ${fieldName}.length)`)
                printSerializePrimitive(element.name, fieldName)
                break;
            } else {
                printSerializePrimitive(element.name, fieldName)
                printSerializePrimitive('Byte', '0')
                break;
            }
        default:
            if (element.kind === 'primitive') {
                printSerializePrimitive(element.name, fieldName)
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
function printSerializeNotNullField(type, fieldName, dimension) {
    if (dimension === 0) {
        printSerializeElement(type, fieldName)
        return
    }

    const sizeType = type.dimensions[dimension - 1].sizeType
    printSerializeSize(sizeType, `${fieldName}.size`)

    const itemName = `item${dimension}`;
    printer.blockStart(`for (${itemName} in ${fieldName}) {`)
    printSerializeField(type, itemName, dimension - 1)
    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @param {string} fieldName
 * @param {number} dimension
 */
function printSerializeField(type, fieldName, dimension = type.dimensions.length) {
    const isArray = dimension > 0
    const optional = isArray ? type.dimensions[dimension - 1].optional : type.optional

    if (optional) {
        printer.line(`buffer.writeBoolean(${fieldName} != null)`)

        printer.blockStart(`${fieldName}?.let {`)
        printSerializeNotNullField(type, 'it', dimension)
        printer.blockEnd('}')
    } else {
        printSerializeNotNullField(type, fieldName, dimension)
    }
}

module.exports = {
    printSerializerImports,
    printSerializeField,
    printSerializeSize
}