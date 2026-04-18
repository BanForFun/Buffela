const {
    printObjectSerializer,
    printLeafIndexSerializer,
    printFieldSerializers
} = require("./objectTypeSerializationUtils");
const {
    printObjectFields,
    printObjectConstructor
} = require("./objectTypeInterfaceUtils");
const {
    printDeserializerConstructor,
    printDeserializerObject,
    printFieldDeserializers
} = require("./objectTypeDeserializationUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @param {string} superClass
 * @param {Record<string, import('@buffela/parser').Field>} superFields
 */
function printObjectTypeClass(type, superClass, superFields) {
    const prefix = type.isLeaf ? "class" : "sealed class"
    const suffix = superClass ? `: ${superClass}` : ''
    printer.blockStart(`${prefix} ${type.name}${suffix} {`)

    printObjectFields(type)
    printObjectConstructor(type, superFields)

    if (options.serializerEnabled) {
        printLeafIndexSerializer(type)
        printFieldSerializers(type)
        printObjectSerializer(type)
    }

    if (options.deserializerEnabled) {
        printFieldDeserializers(type)
        printDeserializerConstructor(type)
        printDeserializerObject(type)
    }

    for (const name in type) {
        printObjectTypeClass(
            type[name],
            type.name,
            { ...superFields, ...type.ownFields }
        )
    }

    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printRootObjectTypeClass(type) {
    const superClass = options.serializerEnabled ? "_Serializable" : ""
    printObjectTypeClass(type, superClass, {})
}

module.exports = { printRootObjectTypeClass }