const yaml = require('yaml')
const Ajv = require('ajv').default
const AjvErrors = require('ajv-errors')

const {readerSchema} = require("../constants/buffelaSchemata")
const {prettifyErrors} = require("./ajvUtils");

const ajv = new Ajv({ allErrors: true })
AjvErrors(ajv)

function validateBuffelaSchema(yamlString) {
    const validate = ajv.compile(readerSchema)
    const buffela = yaml.parse(yamlString)

    const valid = validate(buffela)
    if (valid) return buffela

    const errors = prettifyErrors(validate.errors, buffela, yamlString)
    for (const error of errors) {
        console.log(error.codeFrame())
        console.log('\n')
    }

    throw new Error('Schema validation failed')
}

module.exports = { validateBuffelaSchema }