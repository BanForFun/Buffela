const nativeTypes = require("../constants/nativeTypes");

function printComplexTypeImports() {
    printer.line(`import type { SchemaTypes as _Buffela } from "@buffela/parser"`)
}

function printComplexTypeUtils() {
    if (options.primitives) {
        printer.blockStart("namespace _Primitives {")
        printer.lines(options.primitives.split('\n'))
        printer.blockEnd("}")
        printer.line()
    }
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @returns {string}
 */
function printFieldType(type) {
    const { element: { name, kind }, dimensions } = type;

    const arrayPrefix = dimensions.map(d => d.optional ? "(" : "").join("")
    const arraySuffix = dimensions.map(d => d.optional ? "[] | null)" : "[]").join("")

    const nativeName = nativeTypes[name] ?? (kind === 'primitive' ? `_Primitives.${name}` : name)
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
 * @returns {boolean} isLeaf
 */
function printObjectType(objectType) {
    if (!(objectType.isRoot && objectType.isLeaf)) {
        printer.line(`_type: _Buffela.RelativeSchemaNode<${objectType.path.length - 1}, "${objectType.name}">,`)
    }

    printFields(objectType.ownFields)

    if (objectType.isLeaf) return true;

    printer.blockEndStart('} & (')

    const subtypes = Object.keys(objectType)
    for (let i = 0; i < subtypes.length; i++) {
        if (i === 0) printer.blockStart('{')

        /** @type {import('@buffela/parser').TypeName} */
        const subtypeName = subtypes[i]
        const isLeaf = printObjectType(objectType[subtypeName])

        if (i < subtypes.length - 1) {
            printer.blockEndStart(isLeaf ? '} | {' : ') | {')
        } else {
            printer.blockEnd(isLeaf ? '}' : ')')
        }
    }

    return false;
}

function printComplexTypes() {
    printComplexTypeUtils()

    for (
        /** @type {import('@buffela/parser').TypeName} */
        const name in schema
    ) {
        const type = schema[name]

        if (type.kind === "enum") {
            printer.line(`export type ${name} = _Buffela.AbsoluteSchemaNode<["${name}"]>`)
        } else if (type.kind === "object") {
            printer.blockStart(`export type ${name} = {`)
            const isLeaf = printObjectType(type)
            printer.blockEnd(isLeaf ? '}' : ')')
        }

        printer.line()
    }
}

module.exports = { printComplexTypes, printComplexTypeImports }
