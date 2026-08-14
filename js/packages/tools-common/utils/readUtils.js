const path = require("node:path");
const fs = require("node:fs");

const { validateSchema } = require("./schemaValidationUtils");

/**
 * @param {string} filePath
 * @returns {{ schema: object | null, name: string } | null}
 */
function readSchemaFileSync(filePath) {
    if (filePath.endsWith(".yaml")) {
        const content = fs.readFileSync(filePath, "utf8")
        const schema = validateSchema(content)
        if (schema == null) return null

        return {
            schema: schema,
            name: path.basename(filePath, ".yaml")
        }
    }

    console.error("Only .yaml files are allowed");
    return null
}

module.exports = { readSchemaFileSync }