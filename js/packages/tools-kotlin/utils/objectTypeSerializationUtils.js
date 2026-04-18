const { printSerializeField, printSerializeSize} = require("./fieldSerializationUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printFieldSerializers(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name]

        let prefix = ''
        if (field.override) {
            prefix = 'override'
        } else if (!field.final) {
            prefix = 'protected open'
        }

        if (prefix) {
            printer.blockStart(`${prefix} fun ${name}(buffer: _SerializerBuffer) {`)
            printSerializeField(field.type, `this.${name}`)
            printer.blockEnd('}')
        }
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printObjectSerializer(type) {
    printer.blockStart(`override fun serialize(buffer: _SerializerBuffer) {`)

    if (type.isLeaf) {
        printer.line(`this.serializeLeafIndex(buffer, ${type.leafIndex})`)
    }

    if (!type.isRoot) {
        printer.line(`super.serialize(buffer)`)
    }

    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        if (field.override) continue;

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
    if (!type.isRoot) return;

    printer.blockStart(`protected fun serializeLeafIndex(buffer: _SerializerBuffer, index: Int) {`)
    printSerializeSize(type.leafIndexType, 'index')
    printer.blockEnd('}')
}

module.exports = {
    printLeafIndexSerializer,
    printObjectSerializer,
    printFieldSerializers
};