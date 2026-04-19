const {deserializeField, deserializeSize} = require("./fieldDeserializationUtils");
const { isConstantType } = require("./instantiatedTypeUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printFieldDeserializers(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name];

        let prefix = ''
        if (field.override) {
            prefix = 'override'
        } else if (!field.final) {
            prefix = 'protected open'
        }

        if (prefix) {
            printer.line(`${prefix} fun ${name}(buffer: _DeserializerBuffer) = ${deserializeField(field.type)}`)
        }
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printDeserializerConstructor(type) {
    const prefix = type.isLeaf ? "internal constructor" : "constructor"
    const suffix = type.isRoot ? '' : ': super(buffer)'
    printer.blockStart(`${prefix}(buffer: _DeserializerBuffer)${suffix} {`)

    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        if (field.override) continue;

        if (field.final) {
            printer.line(`this.${name} = ${deserializeField(field.type)}`)
        } else {
            printer.line(`this._${name} = this.${name}(buffer)`)
        }
    }

    printer.blockEnd('}')
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @returns {string}
 */
function leafTypeClass(type) {
    if (type.isRoot) return type.name

    return type.path
        .slice(1)
        .map(t => t.name)
        .join('.')
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printDeserializerObject(type) {
    if (!type.isRoot) return;

    printer.blockStart(`companion object Deserializer: _Deserializer<${type.name}> {`)
    printer.blockStart(`override fun deserialize(buffer: _DeserializerBuffer): ${type.name} {`)

    if (isConstantType(type.leafIndexType)) {
        printer.line(`return ${leafTypeClass(type.leaves[0])}(buffer)`)
    } else {
        printer.blockStart(`return when(val index = ${deserializeSize(type.leafIndexType)}) {`)

        for (const leafType of type.leaves)
            printer.line(`${leafType.leafIndex} -> ${leafTypeClass(leafType)}(buffer)`)

        printer.line(`else -> invalidSubtype(index)`)

        printer.blockEnd('}')
    }

    printer.blockEnd('}')
    printer.blockEnd('}')
}

module.exports = {
    printFieldDeserializers,
    printDeserializerConstructor,
    printDeserializerObject
}