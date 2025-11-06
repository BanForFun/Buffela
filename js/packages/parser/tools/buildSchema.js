const fs = require('node:fs')
const buffelaSchema = require('../constants/buffelaSchema')

fs.writeFileSync("schema.json", JSON.stringify(buffelaSchema, null, 2))