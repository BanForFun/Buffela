const nativeTypes = require("../constants/nativeTypes");
const { isEmpty } = require('./objectUtils')

/**
 *
 * @param {import('@buffela/parser').DataType} type
 * @return {string}
 */
function nativeTypeName(type) {
    if (type.kind === "primitive") {
        const nativeName = nativeTypes[type.name]
        if (nativeName) return "kotlin." + nativeName

        const primitivePackage = options.primitives[type.name]
        if (primitivePackage) return `${primitivePackage}.${type.name}`
    }

    return `${options.package}.${type.name}`
}

/**
 *
 * @param {import('@buffela/parser').InstantiatedFieldType} type
 * @return {string}
 */
function nativeType(type) {
    const prefix = type.dimensions.map(() => "Array<").join("")
    const suffix = type.dimensions.map(d => d.optional ? ">?" : ">").join("")

    const nativeName = nativeTypeName(type.element)
    const nativeType = type.optional ? `${nativeName}?` : nativeName

    return prefix + nativeType + suffix
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printObjectFields(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        const fieldType = nativeType(field.type)

        if (field.override) {
            const prefix = field.final ? "override val" : "open override val"
            printer.line(`${prefix} ${name} get() = _${name} as ${fieldType}`)
        } else if (field.final) {
            printer.line(`val ${name}: ${fieldType}`)
        } else {
            printer.line(`protected val _${name}: ${fieldType}`)
            printer.line(`open val ${name} get() = this._${name}`)
        }
    }

    if (!isEmpty(type.ownFields))
        printer.line()
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @param {Record<string, import('@buffela/parser').Field>} superFields
 */
function printObjectConstructor(type, superFields) {
    printer.blockStart(`constructor(`)

    for (const name in superFields) {
        const field = type.ownFields[name] ?? superFields[name];
        printer.line(`${name}: ${nativeType(field.type)},`)
    }

    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        if (field.override) continue;

        printer.line(`${name}: ${nativeType(field.type)},`)
    }

    printer.blockEndStart(`): super(`)

    for (const name in superFields)
        printer.line(`${name},`)

    printer.blockEndStart(`) {`)

    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        if (field.override) continue;

        if (field.final)
            printer.line(`this.${name} = ${name}`)
        else
            printer.line(`this._${name} = ${name}`)
    }

    printer.blockEnd('}')
}

module.exports = { printObjectFields, printObjectConstructor }