#!/usr/bin/env node

const process = require("node:process");
const fs = require("node:fs");
const path = require("node:path");

const yargs = require('yargs')
const { hideBin } = require("yargs/helpers");

const { parseSchema } = require("@buffela/parser");
const {
    readSchemaFile,
    existsDirSync,
    getNestedDirPath,
    Printer,
    editorSchema,
    processFiles,
    tryReadFileSync
} = require('@buffela/tools-common')

const { printTypes } = require("./utils/schemaUtils");
const { autoDetectPackage } = require("./utils/packageUtils");

yargs()
    .command({
        command: 'compile <schema> [outputDirPath]',
        describe: 'Compiles a buffela schema into kotlin code',
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
            .option('watch', {
                alias: 'w',
                describe: 'Watch for changes',
                type: 'boolean',
                default: false
            })
            .option('package', {
                alias: 'p',
                describe: 'The package name for the generated code',
                type: 'string',
                defaultDescription: '(Auto detect)'
            })
            .option('serializer', {
                describe: 'Generate serializer methods',
                type: 'boolean',
                default: true
            })
            .option('deserializer', {
                describe: 'Generate deserializer methods',
                type: 'boolean',
                default: true
            }),
        handler: (argv) => {
            processFiles(argv.schema, argv.watch, (filePath) => {
                console.log("Compiling", filePath)
                const schemaFile = readSchemaFile(filePath)
                if (schemaFile == null) return

                const outputDirPath = path.join(argv.outputDirPath, getNestedDirPath(filePath))
                if (!existsDirSync(outputDirPath))
                    throw new Error(`Invalid kotlin output directory '${outputDirPath}'`)

                const importsFilePath = path.join(outputDirPath, schemaFile.name + ".imports.kt")
                const importsFileContents = tryReadFileSync(importsFilePath) ?? ""

                const outputFilePath = path.join(outputDirPath, schemaFile.name + ".kt")
                const outputFileStream = fs.createWriteStream(outputFilePath)

                global.schema = parseSchema(schemaFile.schema)
                global.printer = new Printer(outputFileStream)
                global.options = {
                    serializerEnabled: argv.serializer,
                    deserializerEnabled: argv.deserializer,
                    imports: importsFileContents,
                    package: argv.package ?? autoDetectPackage(outputDirPath)
                }

                printTypes()
                outputFileStream.end()
            })
        }
    })
    .command({
        command: 'schema [outputPath]',
        describe: 'Outputs the JSON schema for buffela schemata',
        builder: (yargs) => yargs.positional('outputPath', {
            describe: 'The output file or directory path',
            type: 'string',
            default: '.',
            defaultDescription: '(Current directory)'
        }),
        handler: (argv) => {
            const outputPath = existsDirSync(argv.outputPath)
                ? path.join(argv.outputPath, "buffela-schema.json")
                : argv.outputPath

            fs.writeFileSync(outputPath, JSON.stringify(editorSchema, null, 2))
        }
    })
    .strict()
    .demandCommand(1)
    .help()
    .parse(hideBin(process.argv))