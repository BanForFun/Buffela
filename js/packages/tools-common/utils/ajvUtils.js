const { parseDocument, LineCounter } = require('yaml')

const {getJsonPathComponents} = require("./jsonUtils");
const ValidationError = require("../models/ValidationError");
const AdditionalPropertyError = require("../models/AdditionalPropertyError");

const ignoreKeywords = ["if"]

function createNode() {
    return { children: {}, errors: [] }
}

function parseErrors(errors) {
    const root = createNode();
    for (const error of errors) {
        const components = getJsonPathComponents(error.instancePath)

        let current = root
        for (const component of components) {
            current = (current.children[component] ??= createNode())
        }

        if (!ignoreKeywords.includes(error.keyword))
            // More detailed errors deeper in the tree
            current.errors.push(error)
    }

    return root;
}

function createErrorInstance(error, context) {
    switch (error.keyword) {
        case 'additionalProperties':
            return new AdditionalPropertyError(error, context)
        default:
            return new ValidationError(error, context)
    }
}

function prettifyErrors(errors, data, yaml) {
    const lineCounter = new LineCounter()
    const document = parseDocument(yaml, { lineCounter })

    const context = { data, yaml, document, lineCounter }
    const prettyErrors = []

    const root = parseErrors(errors)
    const stack = [root]

    while (stack.length > 0) {
        const node = stack.pop()

        for (const error of node.errors) {
            prettyErrors.push(createErrorInstance(error, context))
        }

        for (const childKey in node.children) {
            const child = node.children[childKey]
            stack.push(child)
        }
    }

    return prettyErrors
}

module.exports = { prettifyErrors }