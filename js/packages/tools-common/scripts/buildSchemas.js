const fs = require('fs');
const {editorSchema} = require("../constants/buffelaSchemata.js");

try {
    fs.mkdirSync('./schemata')
} catch (err) {
    if (err.code !== 'EEXIST') throw err;
}

fs.writeFileSync("./schemata/buffela-schema.json", JSON.stringify(editorSchema, null, 2))