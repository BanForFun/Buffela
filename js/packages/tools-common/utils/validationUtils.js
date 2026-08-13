const yaml = require('yaml')
const Ajv = require('ajv').default
const AjvErrors = require('ajv-errors')

const {readerSchema} = require("../constants/buffelaSchemata")
const {prettifyErrors} = require("./ajvUtils");

const ajv = new Ajv({ allErrors: true })
AjvErrors(ajv)

const typeNamePattern = /^[A-Z][a-zA-Z\d]*/
const userTypeConfigurations = [true, "concrete"]

function isConcreteType(definition) {
    if (typeof definition === 'object') return true
    if (typeof definition === 'string') return definition.startsWith("Primitive(")

    return false
}

ajv.addKeyword({
    type: "string",
    keyword: "userType",
    schema: true,
    errors: true,
    validate: function validate(schema, data, parentSchema, dataCxt) {
        if (!userTypeConfigurations.includes(schema)) {
            throw new Error(`Invalid schema '${schema}' for userType keyword`)
        }

        const matches = typeNamePattern.exec(data)
        if (!matches) {
            validate.errors = [
                {
                    keyword: "userType",
                    message: `Invalid type`
                }
            ]
            return false
        }

        const typeName = matches[0]
        const typeDefinition = dataCxt.rootData[typeName]
        if (!typeDefinition) {
            validate.errors = [
                {
                    keyword: "userType",
                    message: `Unknown type '${typeName}'`
                }
            ]
            return false
        }

        if (schema === 'concrete' && !isConcreteType(typeDefinition)) {
            validate.errors = [
                {
                    keyword: "userType",
                    message: `Type '${typeName}' is not a concrete type`
                }
            ]
            return false
        }

        return true
    }
})

/**
 *
 * @param {string} yamlString
 * @returns {object | null}
 */
function validateSchema(yamlString) {
    const validate = ajv.compile(readerSchema)
    const buffela = yaml.parse(yamlString)

    const valid = validate(buffela)
    if (valid) return buffela

    const errors = prettifyErrors(validate.errors, buffela, yamlString)
    for (const error of errors) {
        console.error(error.codeFrame())
        console.error('\n')
    }

    return null
}

module.exports = { validateSchema }