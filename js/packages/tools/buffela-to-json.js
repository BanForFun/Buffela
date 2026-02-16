#!/usr/bin/env node

const process = require('node:process')

const { readSchema, getFileOutputStream } = require('@buffela/tools-common')

if (process.argv.length < 3 || process.argv.length > 4) {
    console.error("Usage: node buffela-to-json.js BUFFELA_FILE [OUTPUT_FILE_OR_DIRECTORY]")
    process.exit(1)
}

const inputPath = process.argv[2]
const inputFile = readSchema(inputPath)

const outputPath = process.argv[3]
const outputStream = getFileOutputStream(outputPath, inputFile.name + ".json")

outputStream.write(JSON.stringify(inputFile.schema, null, 2))