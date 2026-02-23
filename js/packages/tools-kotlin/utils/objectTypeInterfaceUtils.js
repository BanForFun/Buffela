const stringUtils = require("./stringUtils");
const nativeTypes = require("../constants/nativeTypes");

/**
 *
 * @param {import('@buffela/parser').InstantiatedType} type
 * @param {number} dimensions
 * @return {string}
 */
function nativeType(type, dimensions = type.dimensions.length) {
    const { name } = type.element;
    const prefix = stringUtils.repeat("Array<", dimensions)
    const suffix = stringUtils.repeat( ">", dimensions)

    return prefix + (nativeTypes[name] ?? name) + suffix
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 */
function printObjectFields(type) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        const fieldType = nativeType(field.type)

        if (field.final) {
            printer.line(`val ${name}: ${fieldType}`)
        } else {
            printer.line(`private val _${name}: ${fieldType}`)
            printer.line(`open val ${name} get() = this._${name}`)
        }
    }

    for (const name in type.fieldOverrides) {
        const field = type.fieldOverrides[name];
        const prefix = field.final ? "val" : "open val"
        printer.line(`override ${prefix} ${name} get() = super.${name} as ${nativeType(field.type)}`)
    }
}

/**
 *
 * @param {import('@buffela/parser').ObjectType} type
 * @param {Record<string, import('@buffela/parser').Field>} superFields
 */
function printObjectConstructor(type, superFields) {
    printer.blockStart(`constructor(`)

    for (const name in superFields) {
        const field = type.fieldOverrides[name] ?? superFields[name];
        printer.line(`${name}: ${nativeType(field.type)},`)
    }

    for (const name in type.ownFields) {
        const field = type.ownFields[name];
        printer.line(`${name}: ${nativeType(field.type)},`)
    }

    printer.blockEndStart(`): super(`)

    for (const name in superFields)
        printer.line(`${name},`)

    printer.blockEndStart(`) {`)

    for (const name in type.ownFields) {
        if (type.ownFields[name].final)
            printer.line(`this.${name} = ${name}`)
        else
            printer.line(`this._${name} = ${name}`)
    }

    printer.blockEnd('}')
}

module.exports = { printObjectFields, printObjectConstructor }