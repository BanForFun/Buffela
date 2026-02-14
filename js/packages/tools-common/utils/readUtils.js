const fs = require("node:fs")
const path = require("node:path");
const { parse } = require('yaml')
const Ajv = require('ajv').default
const AjvErrors = require('ajv-errors')

const {readerSchema} = require("../constants/buffelaSchemata")
const {prettifyErrors} = require("./ajvUtils");

const ajv = new Ajv({ allErrors: true })
AjvErrors(ajv)

function validateYaml(yamlString) {
    const validate = ajv.compile(readerSchema)
    const buffela = parse(yamlString)

    const valid = validate(buffela)
    if (valid) return buffela

    const errors = prettifyErrors(validate.errors, buffela, yamlString)
    for (const error of errors) {
        console.log(error.codeFrame())
        console.log('\n')
    }

    throw new Error('Schema validation failed')
}

/**
 * @param {string} filePath
 * @returns {{ contents: any, name: string }}
 */
function readBuffelaFile(filePath) {
    if (filePath.endsWith(".yaml")) return {
        schema: validateYaml(fs.readFileSync(filePath, "utf8")),
        name: path.basename(filePath, ".yaml")
    }

    throw new Error("Only yaml files are accepted")
}

module.exports = readBuffelaFile