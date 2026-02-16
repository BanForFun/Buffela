import fs from 'fs'
import Schema from "./models/Schema.js";

const schemaJson = JSON.parse(fs.readFileSync('/home/jpeg/Documents/Projects/buffalo/js/sampleBuffela.json'))
const schema = new Schema(schemaJson)

console.log("Done")