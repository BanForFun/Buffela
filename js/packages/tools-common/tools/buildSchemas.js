const fs = require('fs');
const {editorSchema} = require("../constants/buffelaSchemata.js");

try {
    fs.mkdirSync('./schemas')
} catch (err) {
    if (err.code !== 'EEXIST') throw err;
}

fs.writeFileSync("./schemas/buffela.json", JSON.stringify(editorSchema, null, 2))