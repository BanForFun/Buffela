const {optConstSizeTypes, varSizeTypes, fixedSizeTypes} = require('./buffelaTypes.js')

const Pattern = require('../utils/patternUtils')
const Schema = require('../utils/jsonSchemaUtils')

const standardTypes = [ ...varSizeTypes, ...optConstSizeTypes, ...fixedSizeTypes ]

const enumValuePattern = '[A-Z][A-Z_\\d]+'
const fieldNamePattern = '[a-z][a-zA-Z\\d]*'
const typeNamePattern = '[A-Z][a-zA-Z\\d]*'

const fixedSizeTypeNamePattern = Pattern.oneOf(...fixedSizeTypes)
const varSizeTypeNamePattern = Pattern.oneOf(...varSizeTypes)
const optConstSizeTypeNamePattern = Pattern.oneOf(...optConstSizeTypes)
const userTypeNamePattern = Pattern.excludeBehind(typeNamePattern, ...standardTypes)

const sizePattern = Pattern.oneOf(
    "\\d+",
    "UByte",
    "UShort",
    `${typeNamePattern}(?<=Int)(\\(\\d+\\))?` // Do not allow empty parenthesis, only primitives are allowed anyway
)
const optionalSuffixPattern = "\\??"
const arraySuffixPattern = `(\\[${sizePattern}\\]${optionalSuffixPattern})*`


function buildSchema(fieldSchema, typeSchema) {
    return {
        "$defs": {
            //Note: If an alias definition is optional, using it as explicitly optional has no additional effect
            "AliasDefinition": fieldSchema,
            "EnumDefinition": {
                "type": "array",
                "uniqueItems": true,
                "minItems": 1,
                "items": {
                    "type": "string",
                    "pattern": Pattern.anchored(enumValuePattern),
                    "errorMessage": "Must be uppercase and start with a letter; can also contain numbers and underscores."
                }
            },
            "ObjectDefinition": {
                "type": "object",
                "patternProperties": {
                    [Pattern.anchored(fieldNamePattern)]: fieldSchema,
                    [Pattern.anchored(typeNamePattern)]: { "$ref": "#/$defs/ObjectDefinition" }
                },
                "additionalProperties": false,
            }
        },
        "type": "object",
        "patternProperties": {
            [Pattern.anchored(userTypeNamePattern)]: typeSchema
        },
        "additionalProperties": false
    }
}

function fieldSchema(namePattern, suffixPattern, suffixMessage) {
    return Schema.ifThen({
        "type": "string",
        "pattern": `^${namePattern}([^a-zA-Z]|$)`
    }, {
        "type": "string",
        "pattern": Pattern.anchored(namePattern + suffixPattern),
        "errorMessage": suffixMessage
    })
}

const fieldSchemata = [
    fieldSchema(
        fixedSizeTypeNamePattern, `${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected array dimensions e.g. [10] or [UByte]"
    ),

    fieldSchema(
        varSizeTypeNamePattern, `\\(${sizePattern}\\)${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a size e.g. (10) or (UByte)"
    ),

    fieldSchema(
        optConstSizeTypeNamePattern, `(\\(\\d+\\))?${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a constant size e.g. (10) and/or array dimensions e.g. [10] or [UByte]"
    ),

    fieldSchema(
        userTypeNamePattern, `(\\(\\d*\\))?${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a constant size e.g. (10) and/or array dimensions e.g. [10] or [UByte]"
    ),
]

const typeDefinitionSchemata = [
    Schema.ifThen({ "type": "string" }, { "$ref": "#/$defs/AliasDefinition" }),
    Schema.ifThen({ "type": "array" }, { "$ref": "#/$defs/EnumDefinition" }),
    Schema.ifThen({ "type": "object" }, { "$ref": "#/$defs/ObjectDefinition" })
]



const readerSchema = buildSchema(
    Schema.when(fieldSchemata, Schema.fail("Expected field type")),
    Schema.when(typeDefinitionSchemata, Schema.fail("Expected enum, object or alias definition")),
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
                ...fixedSizeTypes,
                ...optConstSizeTypes,
                ...optConstSizeTypes.map(t => `${t}(N)`),
                ...varSizeTypes.map(t => `${t}(N)`),
                ...varSizeTypes.map(t => `${t}(Int)`)
            ]
        },
    ]
}, {
    "oneOf": typeDefinitionSchemata.map(k => k.then)
})

module.exports = {
    editorSchema,
    readerSchema
}