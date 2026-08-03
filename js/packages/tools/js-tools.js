#!/usr/bin/env node

const process = require("node:process");
const path = require("node:path");
const fs = require("node:fs")

const yargs = require('yargs');
const { hideBin } = require("yargs/helpers");

const { parseSchema } = require("@buffela/parser");
const {
    readSchemaFile,
    existsDirSync,
    processFiles,
    getNestedDirPath,
    Printer
} = require('@buffela/tools-common')

const { printTypes } = require("./utils/typeUtils");


yargs()
    .command({
        command: '* <schema> [outputDirPath]',
        describe: 'Converts buffela schemata to JSON and generates type definitions',
        builder: (yargs) => yargs
            .positional('schema', {
                describe: 'Schema path',
                type: 'string'
            })
            .positional('outputDirPath', {
                describe: 'Output directory',
                type: 'string',
                default: '.',
                defaultDescription: '(Current directory)'
            })
            .option('jsonDirPath', {
                alias: 'j',
                describe: 'Json output directory (relative to outputDirPath)',
                type: 'string',
                default: '.'
            })
            .option('typesDirPath', {
                alias: 't',
                describe: 'Types output directory (relative to outputDirPath)',
                type: 'string',
                default: '.'
            })
            .option('watch', {
                alias: 'w',
                describe: 'Watch for changes',
                type: 'boolean',
                default: false
            })
            .option('serializer', {
                describe: 'Generate serializer types',
                type: 'boolean',
                default: true
            })
            .option('deserializer', {
                describe: 'Generate deserializer types',
                type: 'boolean',
                default: true
            }),
        handler: (argv) => {
            processFiles(argv.schema, argv.watch, (filePath) => {
                console.log("Compiling", filePath)
                const inputFile = readSchemaFile(filePath)
                const nestedDirPath = getNestedDirPath(filePath)

                if (argv.jsonDirPath) {
                    const jsonOutputDirPath = path.join(argv.outputDirPath, argv.jsonDirPath, nestedDirPath)
                    if (!existsDirSync(jsonOutputDirPath))
                        throw new Error(`Invalid json output directory '${jsonOutputDirPath}'`)

                    const jsonOutputFilePath = path.join(jsonOutputDirPath, inputFile.name + ".json")
                    const jsonOutputFileStream = fs.createWriteStream(jsonOutputFilePath)

                    jsonOutputFileStream.write(JSON.stringify(inputFile.schema))
                    jsonOutputFileStream.end()
                }

                if (argv.typesDirPath) {
                    const typesOutputDitPath = path.join(argv.outputDirPath, argv.typesDirPath, nestedDirPath)
                    if (!existsDirSync(typesOutputDitPath))
                        throw new Error(`Invalid types output directory '${typesOutputDitPath}'`)

                    const typesOutputFilePath = path.join(typesOutputDitPath, inputFile.name + ".ts")
                    const typesOutputFileStream = fs.createWriteStream(typesOutputFilePath)

                    global.schema = parseSchema(inputFile.schema)
                    global.printer = new Printer(typesOutputFileStream)
                    global.options = { serializerEnabled: argv.serializer, deserializerEnabled: argv.deserializer }

                    printTypes()
                    typesOutputFileStream.end()
                }
            })
        }
    })
    .strict()
    .demandCommand(1)
    .help()
    .parse(hideBin(process.argv))