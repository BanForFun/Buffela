const {optConstSizeTypes, varSizeTypes, fixedSizeTypes} = require('./buffelaTypes.js')

const Pattern = require('../utils/patternUtils')
const Schema = require('../utils/jsonSchemaUtils')

const standardTypes = [...varSizeTypes, ...optConstSizeTypes, ...fixedSizeTypes]
const keywords = ["Primitive"]

const enumValuePattern = '[A-Z][A-Z_\\d]+'
const fieldNamePattern = '[a-z][a-zA-Z\\d]*'
const typeNamePattern = '[A-Z][a-zA-Z\\d]*'

const fixedSizeTypeNamePattern = Pattern.oneOf(...fixedSizeTypes)
const varSizeTypeNamePattern = Pattern.oneOf(...varSizeTypes)
const optConstSizeTypeNamePattern = Pattern.oneOf(...optConstSizeTypes)
const userTypeNamePattern = Pattern.excludeBehind(typeNamePattern, ...standardTypes)
const userPrimitiveNamePattern = Pattern.excludeBehind(typeNamePattern, ...standardTypes, ...keywords)

const numericArgPattern = "(\\(\\d+\\))?"

const sizePattern = Pattern.oneOf(
    "\\d+",
    "UByte",
    "UShort",
    `Int${numericArgPattern}`,
    `UInt${numericArgPattern}`,
)

const optionalSuffixPattern = "\\??"
const arraySuffixPattern = `(\\[${sizePattern}\\]${optionalSuffixPattern})*`


function buildSchema(aliasSchema, fieldTypeSchema, rootTypeSchema) {
    return {
        "$defs": {
            //Note: If an alias definition is optional, using it as explicitly optional has no additional effect
            "AliasDefinition": aliasSchema,
            "EnumDefinition": {
                "type": "array",
                "uniqueItems": true,
                "minItems": 1,
                "items": {
                    "type": "string",
                    "pattern": Pattern.anchored(enumValuePattern),
                    "errorMessage": "Must be uppercase and start with a letter; " +
                        "can also contain numbers and underscores."
                }
            },
            "ObjectDefinition": {
                "type": "object",
                "patternProperties": {
                    [Pattern.anchored(fieldNamePattern)]: fieldTypeSchema,
                    [Pattern.anchored(typeNamePattern)]: { "$ref": "#/$defs/ObjectDefinition" }
                },
                "additionalProperties": false,
            }
        },
        "type": "object",
        "patternProperties": {
            [Pattern.anchored(userTypeNamePattern)]: rootTypeSchema
        },
        "additionalProperties": false
    }
}

function typeSchema(namePattern, suffixPattern, errorMessage, extraKeywords = {}) {
    return Schema.ifThen({
        "type": "string",
        "pattern": `^${namePattern}([^a-zA-Z]|$)`
    }, {
        "type": "string",
        ...extraKeywords,
        "pattern": Pattern.anchored(namePattern + suffixPattern),
        "errorMessage": {
            "pattern": errorMessage
        },
    })
}

const standardTypeSchemata = [
    typeSchema(
        fixedSizeTypeNamePattern, `${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected array dimensions e.g. [10] or [UByte]"
    ),

    typeSchema(
        varSizeTypeNamePattern, `\\(${sizePattern}\\)${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a size e.g. (10) or (UByte)"
    ),

    typeSchema(
        optConstSizeTypeNamePattern, `${numericArgPattern}${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected a constant size e.g. (10) and/or array dimensions e.g. [10] or [UByte]"
    )
]

const fieldTypeSchemata = [
    ...standardTypeSchemata,

    typeSchema(
        userTypeNamePattern, `${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected array dimensions e.g. [10] or [UByte]",
        {
            userType: true
        }
    ),
]

const aliasSchemata = [
    ...standardTypeSchemata,

    typeSchema(
        "Primitive", "\\(\\)",
        "Expected '()'"
    ),

    typeSchema(
        userPrimitiveNamePattern, `${optionalSuffixPattern}${arraySuffixPattern}`,
        "Expected array dimensions e.g. [10] or [UByte]",
        {
            userType: "concrete"
        }
    )
]

const typeDefinitionSchemata = [
    Schema.ifThen({ "type": "string" }, { "$ref": "#/$defs/AliasDefinition" }),
    Schema.ifThen({ "type": "array" }, { "$ref": "#/$defs/EnumDefinition" }),
    Schema.ifThen({ "type": "object" }, { "$ref": "#/$defs/ObjectDefinition" })
]

const readerSchema = buildSchema(
    Schema.when(aliasSchemata, Schema.fail("Expected primitive type or primitive definition")),
    Schema.when(fieldTypeSchemata, Schema.fail("Expected field type")),
    Schema.when(typeDefinitionSchemata, Schema.fail("Expected enum, object or alias definition")),
)

const fieldTypeSuggestions = [
    ...fixedSizeTypes,
    ...optConstSizeTypes,
    ...optConstSizeTypes.map(t => `${t}(N)`),
    ...varSizeTypes.map(t => `${t}(N)`),
    ...varSizeTypes.map(t => `${t}(Int)`)
]

const aliasSuggestions = [
    ...fieldTypeSuggestions,
    "Primitive()"
]

// Some editors *cough* IntelliJ *cough* do not support if/then, we need to simplify the schema
const editorSchema = buildSchema(
    Schema.oneOf(
        aliasSchemata.map(k => k.then).concat(Schema.suggestions(aliasSuggestions)),
    ),
    Schema.oneOf(
        fieldTypeSchemata.map(k => k.then).concat(Schema.suggestions(fieldTypeSuggestions)),
    ),
    Schema.oneOf(
        typeDefinitionSchemata.map(k => k.then)
    )
)

module.exports = {
    editorSchema,
    readerSchema
}