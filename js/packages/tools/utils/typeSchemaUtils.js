function typeSchemaName(name) {
    return `${name}_Schema`
}

/**
 * @param {import('@buffela/parser').ObjectType} objectType
 * @param {string} name
 * @param {...string} path
 */
function printObjectSubtypeSchema(objectType, name, ...path) {
    const fullPath = [...path, name]

    if (objectType.isLeaf) {
        printer.line(`readonly ${name}: { [id]: "${fullPath.join('.')}" }`)
    } else {
        printer.blockStart(`readonly ${name}: {`)

        for (
            /** @type {import('@buffela/parser').TypeName} */
            const subtypeName in objectType
        ) {
            printObjectSubtypeSchema(objectType[subtypeName], subtypeName, ...fullPath)
        }

        printer.blockEnd('}')
    }
}

/**
 * @param {import('@buffela/parser').ObjectType} objectType
 * @param {string} name
 */
function printObjectTypeSchema(objectType, name) {
    printer.blockStart(`type ${typeSchemaName(name)} = {`)

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName in objectType
    ) {
        printObjectSubtypeSchema(objectType[subtypeName], subtypeName, name)
    }

    printer.blockEnd('}')
}

/**
 * @param {import('@buffela/parser').EnumType} enumType
 * @param {string} name
 */
function printEnumTypeSchema(enumType, name) {
    printer.blockStart(`type ${typeSchemaName(name)} = {`)

    for (
        /** @type {import('@buffela/parser').EnumValue} */
        const value in enumType
    ) {
        printer.line(`readonly ${value}: { [id]: "${name}.${value}" }`)
    }

    printer.blockEnd('}')
}

function printTypeSchemata() {
    printer.line()
    printer.line('declare const id: unique symbol')

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const name in schema
    ) {
        const type = schema[name]

        if (type.kind === "enum") {
            printEnumTypeSchema(type, name)
        } else if (type.kind === "object") {
            printObjectTypeSchema(type, name)
        }
    }
}

module.exports = { printTypeSchemata, typeSchemaName }