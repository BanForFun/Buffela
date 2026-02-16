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
const complexTypeNamePattern = enumPattern(...hybridTypes, ...arrayTypes)
const hybridTypeNamePattern = enumPattern(...hybridTypes)
const arrayTypeNamePattern = enumPattern(...arrayTypes)

const constLengthPattern =  "\\d+"
const lengthPattern = enumPattern(...sizeTypes, constLengthPattern)

const sizeSuffixPattern = `\\(${enumPattern(...sizeTypes)}\\)`
const arraySuffixPattern = `(\\[${lengthPattern}\\])*`
const lengthSuffixPattern = `\\(${lengthPattern}\\)`
const hybridSuffixPattern = `(\\(${constLengthPattern}\\))?`

const enumValuePattern = '[A-Z_]+'
const fieldNamePattern = '[a-z][a-zA-Z]*'
const subtypeNamePattern = '[A-Z][a-zA-Z]*'
const typeNamePattern = '[A-Z][a-zA-Z]*'

const globalNamePattern = excludePattern(typeNamePattern, reservedTypeNamePattern)
const simpleTypeNamePattern = excludePattern(typeNamePattern, complexTypeNamePattern)

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

function buildSchema(fieldSchema, sizedSchema, simpleSchema) {
    return {
        "$defs": {
            "AliasDefinition": {
                ...fieldSchema,
                "not": {
                    "type": "string",
                    "pattern": anchoredPattern(typeNamePattern)
                },
                "errorMessage": {
                    "not": "Expected complex type"
                }
            },
            "EnumDefinition": {
                "type": "array",
                "uniqueItems": true,
                "items": {
                    "type": "string",
                    "pattern": anchoredPattern(enumValuePattern)
                }
            },
            "ObjectDefinition": {
                "type": "object",
                "patternProperties": {
                    [anchoredPattern(fieldNamePattern)]: fieldSchema,
                    [anchoredPattern(subtypeNamePattern)]: { "$ref": "#/$defs/ObjectDefinition" },
                    [anchoredPattern(subtypeNamePattern, sizeSuffixPattern)]: { "$ref": "#/$defs/ObjectDefinition" }
                },
                "additionalProperties": false,
            }
        },
        "type": "object",
        "patternProperties": {
            [anchoredPattern(globalNamePattern)]: simpleSchema,
            [anchoredPattern(globalNamePattern, sizeSuffixPattern)]: sizedSchema
        },
        "additionalProperties": false
    }
}

const sizedDefinitionSchemata = [
    ifThen({ "type": "array" }, { "$ref": "#/$defs/EnumDefinition" }),
    ifThen({ "type": "object" }, { "$ref": "#/$defs/ObjectDefinition" })
]

const simpleDefinitionSchemata = [
    ifThen({ "type": "string" }, { "$ref": "#/$defs/AliasDefinition" }),
    ifThen({ "type": "array" }, { "$ref": "#/$defs/EnumDefinition" }),
    ifThen({ "type": "object" }, { "$ref": "#/$defs/ObjectDefinition" })
]

function fieldSchema(namePattern, suffixPattern, suffixMessage) {
    return ifThen({
        "type": "string",
        "pattern": `^${namePattern}([^a-zA-Z]|$)`
    }, {
        "type": "string",
        "pattern": anchoredPattern(namePattern, suffixPattern),
        "errorMessage": suffixMessage
    })
}

const fieldSchemata = [
    fieldSchema(
        simpleTypeNamePattern, arraySuffixPattern,
        "Expected length e.g. [10] or [UByte]"
    ),

    fieldSchema(
        hybridTypeNamePattern, hybridSuffixPattern + arraySuffixPattern,
        "Expected constant size e.g. (10)"
    ),

    fieldSchema(
        arrayTypeNamePattern, lengthSuffixPattern + arraySuffixPattern,
        "Expected length e.g. (10) or (UByte)"
    )
]

const readerSchema = buildSchema(
    when(fieldSchemata, fail("Expected field type")),
    when(sizedDefinitionSchemata, fail("Expected enum or object definition")),
    when(simpleDefinitionSchemata, fail("Expected enum, object or alias definition")),
)

// Some editors *cough* IntelliJ *cough* do not support if/then, we need to simplify the schema
const editorSchema = buildSchema({
    "oneOf": [
        ...fieldSchemata.map(k => k.then),
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
    "oneOf": sizedDefinitionSchemata.map(k => k.then),
}, {
    "oneOf": simpleDefinitionSchemata.map(k => k.then),
})

module.exports = {
    editorSchema,
    readerSchema
}