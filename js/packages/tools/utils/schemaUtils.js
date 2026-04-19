const nativeTypes = require("../constants/nativeTypes");


/**
 * @param {import('@buffela/parser').ObjectType} objectType
 * @param {string} name
 */
function printObjectSubtypeSchema(objectType, name) {
    const path = objectType.path.map(t => `"${t.name}"`).join(", ")
    printer.blockStart(`readonly ${name}: _AbsoluteSubtypeSchema<[${path}]> & {`)

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName in objectType
    ) {
        printObjectSubtypeSchema(objectType[subtypeName], subtypeName)
    }

    printer.blockEnd('}')
}

/**
 * @param {import('@buffela/parser').ObjectType} objectType
 */
function printObjectTypeSchema(objectType) {
    for (
        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName in objectType
    ) {
        printObjectSubtypeSchema(objectType[subtypeName], subtypeName)
    }
}

/**
 * @param {import('@buffela/parser').EnumType} enumType
 */
function printEnumTypeSchema(enumType) {
    for (
        /** @type {import('@buffela/parser').EnumValue} */
        const value in enumType
    ) {
        const entry = enumType[value];
        const path = entry.path.map(t => `"${t.name}"`).join(", ")
        printer.line(`readonly ${value}: _AbsoluteEnumEntry<[${path}]>`)
    }
}

/**
 *
 * @param {import('@buffela/parser').RootType} type
 */
function printTypeSchema(type) {
    if (type.kind === "enum") {
        printEnumTypeSchema(type)
    } else if (type.kind === "object") {
        printObjectTypeSchema(type)
    }
}

function printSchema() {
    printer.blockStart(`type _Schema = {`)

    for (const name in schema) {
        printer.blockStart(`readonly ${name}: _TypeSchema<${name}> & {`)
        printTypeSchema(schema[name])
        printer.blockEnd('}')
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