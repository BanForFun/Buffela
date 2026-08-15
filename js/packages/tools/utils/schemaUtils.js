
function printSchemaTypeImports() {
    if (options.serializerEnabled) printer.line(
        'import type { Serializable as _Serializable, Serializer as _Serializer } from "@buffela/serializer"'
    )

    if (options.deserializerEnabled) printer.line(
        'import type { Deserializable as _Deserializable, Deserializer as _Deserializer } from "@buffela/deserializer"'
    )
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
 */
function printObjectSubtypeSchema(objectType) {
    const path = objectType.path.map(t => `"${t.name}"`).join(", ")
    printer.blockStart(`readonly ${objectType.name}: _Buffela.PolymorphicObjectType<[${path}]> & {`)

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName in objectType
    ) {
        printObjectSubtypeSchema(objectType[subtypeName])
    }

    printer.blockEnd('}')
}

/**
 * @param {import('@buffela/parser').ObjectType} objectType
 */
function printObjectTypeSchema(objectType) {
    const types = [`_TypeSchema<${objectType.name}>`]

    if (!objectType.isLeaf) {
        types.push(`_Buffela.PolymorphicObjectType<["${objectType.name}"]>`)
    }

    printer.blockStart(`readonly ${objectType.name}: ${types.join(' & ')} & {`)

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName in objectType
    ) {
        printObjectSubtypeSchema(objectType[subtypeName])
    }

    printer.blockEnd('}')
}

/**
 * @param {import('@buffela/parser').EnumType} enumType
 */
function printEnumTypeSchema(enumType) {
    const types = [
        `_TypeSchema<${enumType.name}>`,
        `_Buffela.EnumType<["${enumType.name}"]>`
    ]

    printer.blockStart(`readonly ${enumType.name}: ${types.join(' & ')} & {`)

    for (
        /** @type {import('@buffela/parser').EnumValue} */
        const value in enumType
    ) {
        const entry = enumType[value];
        const path = entry.path.map(t => `"${t.name}"`).join(", ")
        printer.line(`readonly ${value}: _Buffela.EnumEntry<[${path}]>`)
    }

    printer.blockEnd('}')
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
        printTypeSchema(schema[name])
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