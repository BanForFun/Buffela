const path = require("node:path");
const fs = require("node:fs");
const {validateBuffelaSchema} = require("./validationUtils");

/**
 * @param {string} filePath
 * @returns {{ schema: any, name: string }}
 */
function readSchemaFile(filePath) {
    if (filePath.endsWith(".yaml")) return {
        schema: validateBuffelaSchema(fs.readFileSync(filePath, "utf8")),
        name: path.basename(filePath, ".yaml")
    }

    throw new Error("Only yaml files are accepted")
}

module.exports = { readSchemaFile }