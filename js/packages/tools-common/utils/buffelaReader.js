const fs = require("node:fs")
const yaml = require("yaml");

/**
 * @param {string} path
 * @returns {unknown}
 */
function readBuffelaFile(path) {
    return yaml.parse(fs.readFileSync(path, "utf8"))
}

module.exports = readBuffelaFile