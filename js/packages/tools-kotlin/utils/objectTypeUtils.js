const {
    printObjectSerializer,
    printOpenFieldSerializers,
    printLeafIndexSerializer, printFieldOverrideSerializers
} = require("./objectTypeSerializationUtils");
const {
    printObjectFields,
    printObjectConstructor
} = require("./objectTypeInterfaceUtils");
const {
    printDeserializerConstructor,
    printDeserializerObject, printOpenFieldDeserializers, printFieldOverrideDeserializers
} = require("./objectTypeDeserializationUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @param {string} superClass
 * @param {Record<string, import('@buffela/parser').Field>} superFields
 * @param {import('@buffela/parser').ObjectType} rootType
 */
function printObjectTypeClass(type, superClass, superFields, rootType) {
    const prefix = type.isLeaf ? "class" : "sealed class"
    const suffix = superClass ? `: ${superClass}` : ''
    printer.blockStart(`${prefix} ${type.name}${suffix} {`)

    printObjectFields(type)
    printObjectConstructor(type, superFields)

    if (options.serializerEnabled) {
        printLeafIndexSerializer(type)
        printFieldOverrideSerializers(type)
        printOpenFieldSerializers(type)
        printObjectSerializer(type, rootType)
    }

    if (options.deserializerEnabled) {
        printFieldOverrideDeserializers(type)
        printOpenFieldDeserializers(type)
        printDeserializerConstructor(type)
        printDeserializerObject(type)
    }

    for (const name in type) {
        printObjectTypeClass(
            type[name],
            type.name,
            { ...superFields, ...type.ownFields, ...type.fieldOverrides },
            rootType
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
    printObjectTypeClass(type, superClass, {}, type)
}

module.exports = { printRootObjectTypeClass }