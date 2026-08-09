
function printSchemaTypeImports() {
    if (options.serializerEnabled) printer.line(
        'import type { Serializable as _Serializable, Serializer as _Serializer } from "@buffela/serializer"'
    )

    if (options.deserializerEnabled) printer.line(
        'import type { Deserializable as _Deserializable, Deserializer as _Deserializer } from "@buffela/deserializer"'
    )

    printer.line()
}

function combineExtensions(extensions) {
    if (!extensions.length) return '{}'
    return extensions.join(' & ')
}

function printSchemaTypeUtils() {
    const typeExtensions = [], primitiveExtensions = []

    if (options.serializerEnabled) {
        typeExtensions.push('_Serializable<T>')
        primitiveExtensions.push('_Serializer<T, A>')
    }

    if (options.deserializerEnabled) {
        typeExtensions.push('_Deserializable<T>')
        primitiveExtensions.push('_Deserializer<T, A>')
    }

    printer.line(`type _TypeSchema<T> = Partial<${combineExtensions(typeExtensions)}>`)
    printer.line(`type _Primitive<T, A> = Partial<${combineExtensions(primitiveExtensions)}>`)
    printer.line()
}

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

function printSchemaType() {
    printSchemaTypeUtils()

    printer.blockStart(`type _Schema = {`)

    for (const name in schema) {
        printer.blockStart(`readonly ${name}: _TypeSchema<${name}> & {`)
        printTypeSchema(schema[name])
        printer.blockEnd('}')
    }

    printer.blockStart('primitiveTypes: {')
    for (const name in schema.primitiveDeclarations) {
        printer.line(`${name}?: _Primitive<_Primitives.${name}, undefined>`)
    }
    printer.blockEnd('}')

    printer.blockEnd('}')

    printer.line()
    printer.line("export default _Schema")

}


module.exports = { printSchemaType, printSchemaTypeImports }