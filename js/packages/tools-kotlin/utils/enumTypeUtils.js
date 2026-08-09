const {printSerializeSize} = require("./fieldSerializationUtils");
const {deserializeSize} = require("./fieldDeserializationUtils");

/**
 *
 * @param {import('@buffela/parser').EnumType} type
 */
function printEnumTypeClass(type) {
    printer.line()
    printer.blockStart(`enum class ${type.name}: _Serializable {`)

    for (const name in type)
        printer.line(`${name},`)

    printer.line(';')
    printer.line()

    printer.blockStart(`override fun serialize(buffer: _SerializerBuffer) {`)

    if (type.entryIndexType) {
        printSerializeSize(type.entryIndexType, 'this.ordinal')
    }

    printer.blockEnd('}')
    printer.line()

    printer.blockStart(`companion object Deserializer: _Deserializer<${type.name}> {`)

    printer.blockStart(`override fun deserialize(buffer: _DeserializerBuffer): ${type.name} {`)
    const entryIndex = type.entryIndexType ? deserializeSize(type.entryIndexType) : 0
    printer.line(`return ${type.name}.entries[${entryIndex}]`)
    printer.blockEnd('}')

    printer.blockEnd('}')

    printer.blockEnd('}')
}

module.exports = { printEnumTypeClass }