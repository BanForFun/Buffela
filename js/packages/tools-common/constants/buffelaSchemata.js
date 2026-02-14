const {
    arrayTypes,
    hybridTypes,
    sizeTypes,
    primitiveTypes
} = require('./buffelaTypes.js')

// Patterns ============================================================================================================

function enumPattern(...options) {
    return `(${options.join('|')})`
}

function anchoredPattern(...parts) {
    return `^${parts.join('')}$`
}

function excludePattern(pattern, exclude) {
    return `${pattern}(?<!^${exclude})`
}

const reservedTypeNamePattern = enumPattern(...primitiveTypes, ...hybridTypes, ...arrayTypes)
const specialTypeNamePattern = enumPattern(...hybridTypes, ...arrayTypes)
const hybridTypeNamePattern = enumPattern(...hybridTypes)
const arrayTypeNamePattern = enumPattern(...arrayTypes)
const sizeTypeNamePattern = enumPattern(...sizeTypes)

const constLengthPattern =  "\\d+"
const lengthPattern = enumPattern(...sizeTypes, constLengthPattern)

const arraySuffixPattern = `(\\[${lengthPattern}\\])*`
const sizeSuffixPattern = `(\\(${sizeTypeNamePattern}\\))?`
const lengthSuffixPattern = `\\(${lengthPattern}\\)`
const hybridSuffixPattern = `(\\(${constLengthPattern}\\))?`

const enumValuePattern = '[A-Z_]+'
const propertyNamePattern = '[a-z][a-zA-Z]*'
const subtypeNamePattern = '[A-Z][a-zA-Z]*'
const typeNamePattern = '[A-Z][a-zA-Z]*'

// Schemata ============================================================================================================

function ifThen(heuristic, full) {
    return { "if": heuristic, "then": full }
}

function when(cases, fallback) {
    return cases.reduceRight((fallback, schema) => {
        return { ...schema, "else": fallback }
    }, fallback)
}

function fail(message) {
    return { "not": {}, "errorMessage": message }
}

function buildSchema(propertySchema, calfSchema) {
    return {
        "$defs": {
            "ObjectDefinition": {
                "type": "object",
                "patternProperties": {
                    [anchoredPattern(propertyNamePattern)]: propertySchema,
                    [anchoredPattern(subtypeNamePattern, sizeSuffixPattern)]: { "$ref": "#/$defs/ObjectDefinition" },
                },
                "additionalProperties": false,
            },
            "EnumDefinition": {
                "type": "array",
                "items": {
                    "type": "string",
                    "pattern": anchoredPattern(enumValuePattern)
                }
            }
        },
        "type": "object",
        "patternProperties": {
            [anchoredPattern(
                excludePattern(typeNamePattern, reservedTypeNamePattern),
                sizeSuffixPattern
            )]: calfSchema,
        },
        "additionalProperties": false
    }
}

const definitionSchemata = [
    ifThen({ "type": "object" }, { "$ref": "#/$defs/ObjectDefinition" }),
    ifThen({ "type": "array" }, { "$ref": "#/$defs/EnumDefinition" })
]

function propertySchema(namePattern, suffixPattern, suffixMessage) {
    return ifThen({
        "type": "string",
        "pattern": `^${namePattern}([^a-zA-Z]|$)`
    }, {
        "type": "string",
        "pattern": anchoredPattern(namePattern, suffixPattern),
        "errorMessage": suffixMessage
    })
}

const propertySchemata = [
    propertySchema(
        excludePattern(typeNamePattern, specialTypeNamePattern), arraySuffixPattern,
        "Expected length e.g. [10] or [UByte]"
    ),

    propertySchema(
        hybridTypeNamePattern, hybridSuffixPattern + arraySuffixPattern,
        "Expected constant size e.g. (10)"
    ),

    propertySchema(
        arrayTypeNamePattern, lengthSuffixPattern + arraySuffixPattern,
        "Expected length e.g. (10) or (UByte)"
    )
]

const readerSchema = buildSchema(
    when(propertySchemata, fail("Invalid property type")),
    when(definitionSchemata,  fail("Invalid definition"))
)

// Some editors *cough* IntelliJ *cough* do not support if/then, we need to simplify the schema
const editorSchema = buildSchema({
    "oneOf": [
        ...propertySchemata.map(k => k.then),
        {
            // For editor suggestions
            "type": "string",
            "pattern": "[]",
            "enum": [
                ...primitiveTypes,
                ...hybridTypes,
                ...arrayTypes.map(t => `${t}(Int)`),
            ]
        },
    ]
}, {
    "oneOf": definitionSchemata.map(k => k.then),
})

module.exports = {
    editorSchema,
    readerSchema
}