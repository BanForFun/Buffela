const {serializeField, serializeSize} = require("./fieldSerializationUtils");

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
            printer.line()
            printer.blockStart(`${prefix} fun ${name}(buffer: _SerializerBuffer) {`)
            serializeField(field.type, `this.${name}`)
            printer.blockEnd('}')
        }
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printObjectSerializer(type) {
    printer.line()
    printer.blockStart(`override fun serialize(buffer: _SerializerBuffer) {`)

    if (type.isLeaf && !!type.path[0].leafIndexType) {
        printer.line(`this.serializeLeafIndex(buffer, ${type.leafIndex})`)
    }

    if (!type.isRoot) {
        printer.line(`super.serialize(buffer)`)
    }

    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        if (field.override) continue;

        if (field.final) {
            serializeField(field.type, `this.${name}`)
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
    if (!type.isRoot || !type.leafIndexType) return;

    printer.line()
    printer.blockStart(`protected fun serializeLeafIndex(buffer: _SerializerBuffer, index: Int) {`)
    serializeSize(type.leafIndexType, 'index')
    printer.blockEnd('}')
}

module.exports = {
    printLeafIndexSerializer,
    printObjectSerializer,
    printFieldSerializers
};