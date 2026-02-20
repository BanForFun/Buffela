const nativeTypes = require("../constants/nativeTypes");
const {typeSchemaName} = require("./typeSchemaUtils");

function combineExtensions(extensions) {
    if (!extensions.length) return '{}'
    return extensions.join(' & ')
}

function printSchemaUtils() {
    const typeExtensions = [], primitiveExtensions = []

    if (options.serializerEnabled) {
        typeExtensions.push('_Serializable<T>')
        primitiveExtensions.push('_Serializer<T>')
    }

    if (options.deserializerEnabled) {
        typeExtensions.push('_Deserializable<T>')
        primitiveExtensions.push('_Deserializer<T>')
    }

    printer.line()
    printer.line(`type _Type<T> = Partial<${combineExtensions(typeExtensions)}>`)
    printer.line(`type _Primitive<T> = Partial<${combineExtensions(primitiveExtensions)}>`)
}

function printSchema() {
    printSchemaUtils()

    printer.blockStart(`type _Schema = {`)

    for (const name in schema) {
        printer.line(`readonly ${name}: ${typeSchemaName(name)} & _Type<${name}>`)
    }

    printer.blockStart('primitiveTypes: {')
    for (const name in schema.primitiveTypes) {
        if (name in nativeTypes) continue;
        printer.line(`${name}?: _Primitive<${name}>`)
    }
    printer.blockEnd('}')

    printer.blockEnd('}')

    printer.line()
    printer.line("export default _Schema")

}

module.exports = { printSchema }