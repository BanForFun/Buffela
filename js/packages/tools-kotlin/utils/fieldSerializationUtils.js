function printSerializerAliases() {
    printer.line('typealias _Serializable = gr.elaevents.buffela.serialization.Serializable')
    printer.line('typealias _SerializerBuffer = gr.elaevents.buffela.serialization.SerializerBuffer')
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
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {string | number} size
 */
function printSerializeSize(type, size) {
    const { element } = type
    if (typeof element === 'number') {
        printer.blockStart(`if (${size} != ${element}) {`)
        printer.line(`throw IllegalStateException("Expected size '${element}' (got '\${${size}}')")`)
        printer.blockEnd('}')

        return;
    }

    let constantSuffix = "u"
    let converterExtension = ""

    switch (element.name) {
        case 'UByte':
            converterExtension = ".toUByte()";
            break;
        case 'UShort':
            converterExtension = ".toUShort()";
            break;
        case 'Unsigned':
            converterExtension = ".toUInt()";
            break;
        default:
            constantSuffix = "";
            break;
    }

    if (typeof size === 'number') {
        printSerializePrimitive(element.name, size + constantSuffix)
    } else {
        printSerializeField(type, size + converterExtension)
    }
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {string} arrayName
 * @param {string} itemPrimitive
 */
function printSerializeArray(type, arrayName, itemPrimitive) {
    printSerializeSize(type.argument, `${arrayName}.size`)

    const itemName = `item0`;
    printer.blockStart(`for (${itemName} in ${arrayName}) {`)
    printSerializePrimitive(itemPrimitive, itemName)
    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {string} fieldName
 * @param {number} dimension
 */
function printSerializeField(type, fieldName, dimension = type.dimensions.length) {
    if (dimension > 0) {
        const sizeType = type.dimensions[dimension - 1]
        printSerializeSize(sizeType, `${fieldName}.size`)

        const itemName = `item${dimension}`;
        printer.blockStart(`for (${itemName} in ${fieldName}) {`)
        printSerializeField(type, itemName, dimension - 1)
        printer.blockEnd('}')

        return
    }

    const { element, argument } = type
    switch(element.name) {
        case 'ByteArray':
            printSerializeArray(type, fieldName, 'Byte')
            break;
        case 'UByteArray':
            printSerializeArray(type, fieldName, 'UByte')
            break;
        case 'ShortArray':
            printSerializeArray(type, fieldName, 'Short')
            break;
        case 'UShortArray':
            printSerializeArray(type, fieldName, 'UShort')
            break;
        case 'IntArray':
            printSerializeArray(type, fieldName, 'Int')
            break;
        case 'UIntArray':
            printSerializeArray(type, fieldName, 'UInt')
            break;
        case 'LongArray':
            printSerializeArray(type, fieldName, 'Long')
            break;
        case 'ULongArray':
            printSerializeArray(type, fieldName, 'ULong')
            break;
        case 'FloatArray':
            printSerializeArray(type, fieldName, 'Float')
            break;
        case 'DoubleArray':
            printSerializeArray(type, fieldName, 'Double')
            break;
        case 'BooleanArray':
            printSerializeArray(type, fieldName, 'Boolean')
            break;
        case 'Buffer':
            printSerializeSize(argument, `${fieldName}.size`)
            printSerializePrimitive('ByteArray', fieldName)
            break;
        case 'Unsigned':
        case 'Signed':
            printSerializePrimitive(element.name, fieldName, argument.element.toString())
            break;
        case 'String':
            if (argument) {
                printer.blockStart(`if (${fieldName}.length != ${argument.element}) {`)
                printer.line(`throw IllegalStateException("Expected string length '${argument.element}' (got '\${${fieldName}.length}')")`)
                printer.blockEnd('}')

                printSerializePrimitive(element.name, fieldName)
                break;
            } else {
                printSerializePrimitive(element.name, fieldName, 'true')
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

module.exports = {
    printSerializerAliases,
    printSerializeField,
    printSerializeSize
}