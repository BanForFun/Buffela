const {
    sentinelTypes,
    constSizedTypes,
    sizedTypes,
    scalarTypes
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


const sentinelTypeNamePattern = enumPattern(...sentinelTypes)
const sizedTypeNamePattern = enumPattern(...sizedTypes)
const constSizedTypeNamePattern = enumPattern(...constSizedTypes)

const constSizePattern =  "\\d+"
const sentinelTypeSuffixPattern = `(\\(${constSizePattern}\\))?`
const constSizedTypeSuffixPattern = `\\(${constSizePattern}\\)`

const sizePattern = enumPattern(
    constSizePattern,
    "UByte",
    "UShort",
    "Int",
    "Unsigned" + constSizedTypeSuffixPattern
)
const sizedTypeSuffixPattern = `\\(${sizePattern}\\)`
const arraySuffixPattern = `(\\[${sizePattern}\\])*`

const enumValuePattern = '[A-Z][A-Z_\\d]+'
const fieldNamePattern = '[a-z][a-zA-Z\\d]*'
const typeNamePattern = '[A-Z][a-zA-Z\\d]*'

const reservedTypeNamePattern = enumPattern(...sentinelTypes, ...sizedTypes, ...constSizedTypes, ...scalarTypes)
const rootTypeNamePattern = excludePattern(typeNamePattern, reservedTypeNamePattern)

const parameterizedTypeNamePattern = enumPattern(...sentinelTypes, ...sizedTypes, ...constSizedTypes)
const simpleTypeNamePattern = excludePattern(typeNamePattern, parameterizedTypeNamePattern)

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

function buildSchema(fieldSchema, typeSchema) {
    return {
        "$defs": {
            "AliasDefinition": {
                ...fieldSchema,
                "not": {
                    "type": "string",
                    "pattern": anchoredPattern(typeNamePattern)
                },
                "errorMessage": {
                    "not": "Expected parameterized or array type"
                }
            },
            "EnumDefinition": {
                "type": "array",
                "uniqueItems": true,
                "minItems": 1,
                "items": {
                    "type": "string",
                    "pattern": anchoredPattern(enumValuePattern)
                }
            },
            "ObjectDefinition": {
                "type": "object",
                "patternProperties": {
                    [anchoredPattern(fieldNamePattern)]: fieldSchema,
                    [anchoredPattern(typeNamePattern)]: { "$ref": "#/$defs/ObjectDefinition" }
                },
                "additionalProperties": false,
            }
        },
        "type": "object",
        "patternProperties": {
            [anchoredPattern(rootTypeNamePattern)]: typeSchema
        },
        "additionalProperties": false
    }
}

const typeDefinitionSchemata = [
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
        "Expected a size e.g. [10] or [UByte]"
    ),

    fieldSchema(
        sentinelTypeNamePattern, sentinelTypeSuffixPattern + arraySuffixPattern,
        "Expected a constant size e.g. (10)"
    ),

    fieldSchema(
        sizedTypeNamePattern, sizedTypeSuffixPattern + arraySuffixPattern,
        "Expected a size e.g. (10) or (UByte)"
    ),

    fieldSchema(
        constSizedTypeNamePattern, constSizedTypeSuffixPattern + arraySuffixPattern,
        "Expected a constant size e.g. (10)"
    )
]

const readerSchema = buildSchema(
    when(fieldSchemata, fail("Expected field type")),
    when(typeDefinitionSchemata, fail("Expected enum, object or alias definition")),
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
                ...sentinelTypes,
                ...constSizedTypes.map(t => `${t}(4)`),
                ...sizedTypes.map(t => `${t}(Int)`),
                ...scalarTypes
            ]
        },
    ]
}, {
    "oneOf": typeDefinitionSchemata.map(k => k.then),
})

module.exports = {
    editorSchema,
    readerSchema
}