const nativeTypes = require("../constants/nativeTypes");
const {typeSchemaName} = require("./typeSchemaUtils");

/**
 *
 * @param {...string} path
 * @returns {string}
 */
function typeOf(...path) {
    const [root, ...rest] = path;
    return `${typeSchemaName(root)}${rest.map(n => `["${n}"]`).join("")}`
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @returns {string}
 */
function printFieldType(type) {
    const { element: { name }, dimensions } = type;

    const arrayPrefix = dimensions.map(d => d.optional ? "(" : "").join("")
    const arraySuffix = dimensions.map(d => d.optional ? "[] | null)" : "[]").join("")

    const nativeName = nativeTypes[name] ?? name
    const nativeType = type.optional ? `(${nativeName} | null)` : nativeName

    return arrayPrefix + nativeType + arraySuffix
}

/**
 *
 * @param {Record<string, import('@buffela/parser').Field>} fields
 */
function printFields(fields) {
    for (const fieldName in fields) {
        printer.line(`${fieldName}: ${printFieldType(fields[fieldName].type)},`)
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} objectType
 * @param {string} name
 * @param {...string} path
 * @returns {boolean} isLeaf
 */
function printObjectType(objectType, name, ...path) {
    const fullPath = [...path, name]

    if (!objectType.isRoot)
        printer.line(`${objectType.parent.name}_type: ${typeOf(...fullPath)},`)

    printFields(objectType.ownFields)
    printFields(objectType.fieldOverrides)

    if (objectType.isLeaf) return true;

    printer.blockEndStart('} & (')

    const subtypes = Object.keys(objectType)
    for (let i = 0; i < subtypes.length; i++) {
        if (i === 0) printer.blockStart('{')

        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName = subtypes[i]

        const subtype = objectType[subtypeName]
        const isLeaf = printObjectType(subtype, subtypeName, ...fullPath)

        if (i < subtypes.length - 1) {
            printer.blockEndStart(isLeaf ? '} | {' : ') | {')
        } else {
            printer.blockEnd(isLeaf ? '}' : ')')
        }
    }

    return false;
}

function printSchemaTypes() {
    for (
        /** @type {import('@buffela/parser').TypeName} */
        const name in schema
    ) {
        const type = schema[name]

        if (type.kind === "enum") {
            printer.line()
            printer.line(`export type ${name} = ${typeSchemaName(name)}[keyof ${typeSchemaName(name)}]`)
        } else if (type.kind === "object") {
            printer.blockStart(`export type ${name} = {`)
            const isLeaf = printObjectType(type, name)
            printer.blockEnd(isLeaf ? '}' : ')')
        }
    }
}

module.exports = { printSchemaTypes}
