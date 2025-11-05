const path = require("node:path");

const readBuffalo = require("../buffaloReader");
const Printer = require("./models/Printer");
const {getOutputStream} = require("./utils/fileUtils");
const {printEnumTypeClass} = require("./kotlinGenerator/enumTypes");
const {printDataTypeClass} = require("./kotlinGenerator/dataTypes");
const {printSerializerImports} = require("./kotlinGenerator/fieldSerializer");
const {printDeserializerImports} = require("./kotlinGenerator/fieldDeserializer");

if (process.argv.length < 3 || process.argv.length > 4) {
    console.error("Usage: node generateKotlinClasses.js BUFFALO_FILE [OUTPUT_FILE_OR_DIRECTORY]")
    process.exit(1)
}

const inputPath = process.argv[2]
const buffalo = readBuffalo(inputPath)
const objectName = path.basename(inputPath, ".yaml")

const outputStream = getOutputStream(process.argv[3], objectName + ".kt")
global.printer = new Printer(outputStream)

printSerializerImports()
printDeserializerImports()

for (const calfName in buffalo) {
    const calf = buffalo[calfName]

    if (calf.type === "enum") {
        printEnumTypeClass(calf)
    } else if (calf.type === "data") {
        printDataTypeClass(calf)
    } else {
        throw new Error(`Unknown definition type '${calf.type}' at '${calf.name}'`)
    }
}
