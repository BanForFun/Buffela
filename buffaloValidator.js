const Ajv = require("ajv")
const buffaloSchema = require("./buffaloSchema.js")
const { typeType, schemaTypeIndices } = require("./buffaloTypes.js")

const ajv = new Ajv()

const validateSchema = ajv.compile(buffaloSchema)

function validateEnum(calf, path) {
    const seen = new Set();
    for (const name of calf) {
        if (seen.has(name))
            throw new Error(`Duplicate enum value '${name} at '${path}'`)

        seen.add(name)
    }
}

function validateData(buffalo, calf, path, definedAt = {}) {
    let isAbstract = false;

    for (const childName in calf) {
        const child = calf[childName]
        if (typeof child === 'object') {
            isAbstract = true;
            validateData(buffalo, child, `${path}/${childName}`, {...definedAt})
        } else if (childName in definedAt) {
            throw new Error(`Duplicate field definition '${childName}' at '${path}'. First defined in '${definedAt[childName]}'.`)
        } else {
            definedAt[childName] = path

            const baseType = /^[a-zA-Z]+/.exec(child)[0]
            if (baseType in schemaTypeIndices) continue;
            if (baseType in buffalo) continue;
            if (baseType === typeType) continue;

            throw new Error(`Unknown type ${baseType} at '${path}'.`)
        }
    }

    if (isAbstract) {
        const typeFields = Object.entries(calf)
            .filter(([_, type]) => type === typeType)
            .map(([name]) => name)

        if (typeFields.length > 1)
            throw new Error(`Multiple type descriminator fields at '${path}': ${typeFields}.`)

        if (typeFields.length < 1)
            throw new Error(`No type descriminator field at abstract definition '${path}'.`)
    }
}


function validateBuffalo(buffalo) {
    if (!validateSchema(buffalo)) {
        console.error(ajv.errors?.reverse())
        throw new Error('Schema validation failed')
    }

    for (const calfName in buffalo) {
        const calf = buffalo[calfName]
        if (Array.isArray(calf)) 
            validateEnum(calf, calfName)
        else
            validateData(buffalo, calf, calfName)
    }
}

module.exports = validateBuffalo
