const {
    sentinelTypes,
    sizedTypes,
    fixedSizeTypes
} = require('./buffelaTypes.js')

const Pattern = require('../utils/patternUtils')
const Schema = require('../utils/jsonSchemaUtils')


const sizedTypeNamePattern = Pattern.oneOf(...sizedTypes)

const enumValuePattern = '[A-Z][A-Z_\\d]+'
const fieldNamePattern = '[a-z][a-zA-Z\\d]*'
const typeNamePattern = '[A-Z][a-zA-Z\\d]*'

const reservedTypeNamePattern = Pattern.oneOf(...sentinelTypes, ...sizedTypes, ...fixedSizeTypes)
const rootTypeNamePattern = Pattern.exclude(typeNamePattern, reservedTypeNamePattern)

const optionalSuffixPattern = "\\??"
const constSizeSuffixPattern =  "(\\(\\d*\\))?"

const sizePattern = Pattern.oneOf(
    constSizeSuffixPattern,
    "UByte",
    "UShort",
    `${typeNamePattern}(?<=Int)${constSizeSuffixPattern}`
)

const arraySuffixPattern = `(\\[${sizePattern}\\]${optionalSuffixPattern})*`


function buildSchema(fieldSchema, typeSchema) {
    return {
        "$defs": {
            //Note: If an alias definition is optional, using it as explicitly optional has no additional effect
            "AliasDefinition": fieldSchema, //TODO: Maybe force training parenthesis for clarity
            "EnumDefinition": {
                "type": "array",
                "uniqueItems": true,
                "minItems": 1,
                "items": {
                    "type": "string",
                    "pattern": Pattern.anchored(enumValuePattern),
                    "errorMessage": "Must be capitalized and can contain uppercase letters, numbers and underscores"
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
            [Pattern.anchored(rootTypeNamePattern)]: typeSchema
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
        typeNamePattern, `${constSizeSuffixPattern}${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a size or array dimensions e.g. (10), [10] or [UByte]"
    ),

    fieldSchema(
        sizedTypeNamePattern, `\\(${sizePattern}\\)${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a size e.g. (10) or (UByte)"
    )
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
                ...sentinelTypes,
                ...sentinelTypes.map(t => `${t}(N)`),
                ...sizedTypes.map(t => `${t}(N)`),
                ...sizedTypes.map(t => `${t}(Int)`)
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