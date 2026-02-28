const { printSerializeField, printSerializeSize} = require("./fieldSerializationUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printOpenFieldSerializers(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        if (field.final) continue;

        printer.blockStart(`protected open fun ${name}(buffer: _SerializerBuffer) {`)
        printSerializeField(field.type, `this.${name}`)
        printer.blockEnd('}')
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printFieldOverrideSerializers(type) {
    for (const name in type.fieldOverrides) {
        const field = type.fieldOverrides[name]
        const prefix = field.final ? 'override' : 'open override'

        printer.blockStart(`${prefix} fun ${name}(buffer: _SerializerBuffer) {`)
        printSerializeField(field.type, `this.${name}`)
        printer.blockEnd('}')
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @param {import('@buffela/parser').ObjectType} rootType
 */
function printObjectSerializer(type, rootType) {
    printer.blockStart(`override fun serialize(buffer: _SerializerBuffer) {`)

    if (type.isLeaf && rootType.defaultArgument) {
        printer.line(`this.serializeLeafIndex(buffer, ${type.leafIndex})`)
    }

    if (!type.isRoot) {
        printer.line(`super.serialize(buffer)`)
    }

    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        if (field.final) {
            printSerializeField(field.type, `this.${name}`)
        } else {
            printer.line(`this.${name}(buffer)`)
        }
    }

    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printLeafIndexSerializer(type) {
    if (!type.isRoot || !type.defaultArgument) return;

    printer.blockStart(`protected fun serializeLeafIndex(buffer: _SerializerBuffer, index: Int) {`)
    printSerializeSize(type.defaultArgument, 'index')
    printer.blockEnd('}')
}

module.exports = {
    printLeafIndexSerializer,
    printObjectSerializer,
    printOpenFieldSerializers,
    printFieldOverrideSerializers
};