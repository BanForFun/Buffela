const fs = require("node:fs")
const path = require("node:path");

const yaml = require("yaml");

/**
 * @param {string} filePath
 * @returns {{ schema: unknown, name: string }}
 */
function readBuffelaFile(filePath) {
    if (filePath.endsWith(".yaml")) return {
        schema: yaml.parse(fs.readFileSync(filePath, "utf8")),
        name: path.basename(filePath, ".yaml")
    }

    if (filePath.endsWith(".json")) return {
        schema: JSON.parse(fs.readFileSync(filePath, "utf8")),
        name: path.basename(filePath, ".json")
    }

    throw new Error("Only yaml and json files are accepted")
}

module.exports = readBuffelaFile