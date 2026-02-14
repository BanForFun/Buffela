const chalk = require('chalk').default
const { codeFrameColumns } = require('@babel/code-frame');
const { getJsonPathComponents } = require("../utils/jsonUtils");

class ValidationError {
    constructor(details, context) {
        this.instancePath = details.instancePath
        this.schemaPath = details.schemaPath
        this.message = details.message
        this.keyword = details.keyword
        this.params = details.params

        this.lineCounter = context.lineCounter
        this.yaml = context.yaml
        this.document = context.document
    }

    getPosition(offset) {
        const position = this.lineCounter.linePos(offset)
        return { line: position.line, column: position.col }
    }

    getNode() {
        return this.document.getIn(getJsonPathComponents(this.instancePath), true)
    }

    codeFrame(message, node = this.getNode()) {
        const [start, end] = node.range

        const frame = codeFrameColumns(this.yaml, {
            start: this.getPosition(start),
            end: this.getPosition(end)
        }, {
            highlightCode: true,
            message: message
        })

        const lines = [
            `${chalk.red.bold(`[${this.keyword}]`)} ${this.message}`,
            // `    ${chalk.blue(`at ${this.schemaPath}`)}\n`,
            frame
        ]

        return lines.join('\n')
    }
}

module.exports = ValidationError;