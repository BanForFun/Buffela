#!/usr/bin/env node

const process = require("node:process");
const fs = require("node:fs");
const path = require("node:path");

const yaml = require('yaml')
const yargs = require('yargs')
const { hideBin } = require("yargs/helpers");
const { parseSchema } = require("@buffela/parser");
const {
    readSchemaFileSync,
    existsDirSync,
    Printer,
    editorSchema,
    processFiles,
    tryReadFileSync
} = require('@buffela/tools-common')

const { printTypes } = require("./utils/schemaUtils");
const { autoDetectPackage } = require("./utils/packageUtils");

yargs()
    .command({
        command: 'compile <schemaFile> [outputDir]',
        describe: 'Compiles a buffela schema into kotlin code',
        builder: (yargs) => yargs
            .option('rootDirs', {
                alias: 'r',
                describe: 'The directory paths that are in scope',
                type: 'array',
                default: ['.'],
                defaultDescription: '(The current working directory)'
            })
            .positional('schemaFile', {
                describe: 'Schema path, relative to each root directory',
                type: 'string'
            })
            .positional('outputDir', {
                describe: 'Output directory path, relative to each root directory',
                type: 'string',
                default: '.',
                defaultDescription: '(The root directory)'
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
            processFiles(argv.rootDirs, argv.schemaFile, argv.watch, (paths) => {
                console.log("Compiling", paths.inputFile)

                const schemaFile = readSchemaFileSync(paths.inputFile)
                if (schemaFile == null) return

                const outputDirPath = path.join(paths.outputRootDir, argv.outputDir, paths.outputSubDir)
                if (!existsDirSync(outputDirPath))
                    throw new Error(`Invalid output directory '${outputDirPath}'`)

                const primitivesFilePath = path.join(outputDirPath, schemaFile.name + ".primitives.yaml")
                const primitivesFileContents = tryReadFileSync(primitivesFilePath)
                const primitives = primitivesFileContents ? yaml.parse(primitivesFileContents) : {}

                const outputFilePath = path.join(outputDirPath, schemaFile.name + ".kt")
                const outputFileStream = fs.createWriteStream(outputFilePath)

                global.schema = parseSchema(schemaFile.schema)
                global.printer = new Printer(outputFileStream)
                global.options = {
                    serializerEnabled: argv.serializer,
                    deserializerEnabled: argv.deserializer,
                    primitives: primitives,
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