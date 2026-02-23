const {printSerializeSize} = require("./fieldSerializationUtils");
const {deserializeSize} = require("./fieldDeserializationUtils");

/**
 *
 * @param {import('@buffela/parser').EnumType} type
 */
function printEnumTypeClass(type) {
    printer.blockStart(`enum class ${type.name}: _Serializable {`)

    for (const name in type)
        printer.line(`${name},`)

    printer.line(';')

    printer.blockStart(`override fun serialize(buffer: _SerializerBuffer) {`)

    if (type.defaultArgument)
        printSerializeSize(type.defaultArgument, 'this.ordinal')

    printer.blockEnd('}')

    printer.blockStart(`companion object Deserializer: _Deserializer<${type.name}> {`)

    printer.blockStart(`override fun deserialize(buffer: _DeserializerBuffer): ${type.name} {`)
    printer.line(`return ${type.name}.entries[${type.defaultArgument ? deserializeSize(type.defaultArgument) : 0}]`)
    printer.blockEnd('}')

    printer.blockEnd('}')

    printer.blockEnd('}')
}

module.exports = { printEnumTypeClass }