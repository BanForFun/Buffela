#!/usr/bin/env node

const process = require('node:process')

const { readBuffelaFile, fileUtils } = require('@buffela/tools-common')

if (process.argv.length < 3 || process.argv.length > 4) {
    console.error("Usage: node buffela-to-json.js BUFFELA_FILE [OUTPUT_FILE_OR_DIRECTORY]")
    process.exit(1)
}

const inputPath = process.argv[2]
const inputFile = readBuffelaFile(inputPath)

const outputPath = process.argv[3]
const outputStream = fileUtils.getFileOutputStream(outputPath, inputFile.name + ".json")

outputStream.write(JSON.stringify(inputFile.schema, null, 2))