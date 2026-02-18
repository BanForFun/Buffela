const nativeTypes = require("../constants/nativeTypes");
const {typeSchemaName} = require("./typeSchemaUtils");

function combineExtensions(extensions) {
    if (!extensions.length) return '{}'
    return extensions.join(' & ')
}

function printSchemaUtils() {
    const typeExtensions = [], primitiveExtensions = []

    if (options.serializerEnabled) {
        typeExtensions.push('serializable<T>')
        primitiveExtensions.push('serializer<T>')
    }

    if (options.deserializerEnabled) {
        typeExtensions.push('deserializable<T>')
        primitiveExtensions.push('deserializer<T>')
    }

    printer.line()
    printer.line(`type type<T> = Partial<${combineExtensions(typeExtensions)}>`)
    printer.line(`type primitive<T> = Partial<${combineExtensions(primitiveExtensions)}>`)
}

function printSchema() {
    printSchemaUtils()

    printer.blockStart(`type schema = {`)

    for (const name in schema) {
        printer.line(`readonly ${name}: ${typeSchemaName(name)} & type<${name}>`)
    }

    printer.blockStart('primitives: {')
    for (const name in schema.primitives) {
        if (name in nativeTypes) continue;
        printer.line(`${name}?: primitive<${name}>`)
    }
    printer.blockEnd('}')

    printer.blockEnd('}')

    printer.line()
    printer.line("export default schema")

}

module.exports = { printSchema }