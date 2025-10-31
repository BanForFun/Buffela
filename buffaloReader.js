const fs = require("node:fs")
const yaml = require('yaml')

const validateBuffalo = require('./buffaloValidator')
const { schemaTypes, typeType } = require('./buffaloTypes')

function parseEnum(calf, name) {
    const values = {};
    for (let i = 0; i < calf.length; i++) {
        const value = calf[i];
        values[value] = { value: i }
    }

    values.values = { ...values }
    values.type = "enum"
    values.typeName = name

    return Object.freeze(values);
}

function resolveType(buffalo, type) {
    if (/^\d+$/.test(type)) return type

    const schemaTypeIndex = schemaTypes.indexOf(type)
    if (schemaTypeIndex >= 0) return schemaTypeIndex

    const resolved = buffalo[type]
    if (!resolved) throw new Error(`Unknown type '${type}'`) //TODO: Better tracability

    return resolved
}

function createType() {
    return {
        base: "",
        dimensions: [],
        size: null
    }
}

function parseType(buffalo, string) {
    const stack = [createType()]

    for (const char of string) {
        const current = stack.at(-1)
        switch(char) {
        case '(':
            const sizeParam = createType()
            current.size = sizeParam

            stack.push(sizeParam)
            break;
        case '[':
            const dimension = createType()
            current.dimensions.push(dimension)

            stack.push(dimension)
            break;
        case ']':
        case ')':
            current.base = resolveType(buffalo, current.base)
            stack.pop()
            break;
        default: 
            current.base += char;
            break;
        }
    }

    const root = stack[0]
    root.base = resolveType(buffalo, root.base)

    return root;
}

function linkData(buffalo, calf) {
    const types = []
    const fields = {}

    for (const childName in calf) {
        const child = calf[childName]
        if (typeof child === 'object') {
            linkData(buffalo, child)

            child.name = childName
            child.index = types.length
            types.push(child)
        } else {
            delete calf[childName]

            if (child === typeType) {
                calf.typeKey = childName
            } else {
                fields[childName] = parseType(buffalo, child)
            }
        }
    }

    calf.types = types
    calf.fields = fields
}

function readBuffalo(path) {
    const buffalo = yaml.parse(fs.readFileSync(path, "utf8"))
    validateBuffalo(buffalo)

    for (const calfName in buffalo) {
        const calf = buffalo[calfName];
        if (Array.isArray(calf)) {
            buffalo[calfName] = parseEnum(calf, calfName)
        } else {
            linkData(buffalo, calf)
            calf.type = "data"
            calf.typeName = calfName
        }
    }

    return buffalo
}

module.exports = readBuffalo