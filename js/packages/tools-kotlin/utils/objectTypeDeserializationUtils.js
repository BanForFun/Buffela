const {deserializeField, deserializeSize} = require("./fieldDeserializationUtils");

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printOpenFieldDeserializers(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        if (field.final) continue;

        printer.line(`protected open fun ${name}(buffer: _DeserializerBuffer) = ${deserializeField(field.type)}`)
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printFieldOverrideDeserializers(type) {
    for (const name in type.fieldOverrides) {
        const field = type.fieldOverrides[name]
        const prefix = field.final ? 'override' : 'open override'

        printer.line(`${prefix} fun ${name}(buffer: _DeserializerBuffer) = ${deserializeField(field.type)}`)
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

    const names = []
    do {
        names.push(type.name)
        type = type.parent
    } while (!type.isRoot)

    return names.reverse().join('.')
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printDeserializerObject(type) {
    if (!type.isRoot) return;

    printer.blockStart(`companion object Deserializer: _Deserializer<${type.name}> {`)
    printer.blockStart(`override fun deserialize(buffer: _DeserializerBuffer): ${type.name} {`)

    if (type.defaultArgument) {
        printer.blockStart(`return when(${deserializeSize(type.defaultArgument)}) {`)

        for (const leafType of type.leaves)
            printer.line(`${leafType.leafIndex} -> ${leafTypeClass(leafType)}(buffer)`)

        printer.line(`else -> throw IllegalStateException("Invalid subtype index")`)

        printer.blockEnd('}')
    } else {
        printer.line(`return ${leafTypeClass(type.leaves[0])}(buffer)`)
    }

    printer.blockEnd('}')
    printer.blockEnd('}')
}

module.exports = {
    printOpenFieldDeserializers,
    printFieldOverrideDeserializers,
    printDeserializerConstructor,
    printDeserializerObject
}