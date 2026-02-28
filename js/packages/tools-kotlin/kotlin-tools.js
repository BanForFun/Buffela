#!/usr/bin/env node

const process = require("node:process");

const yargs = require('yargs')
const { hideBin } = require("yargs/helpers");

const { readSchemaFile, getFileOutputStream, Printer, editorSchema} = require('@buffela/tools-common')
const { parseSchema } = require("@buffela/parser");

const { printTypes } = require("./utils/typeUtils");

yargs()
    .command({
        command: 'compile <schema> [destination]',
        describe: 'Compiles a buffela schema into kotlin',
        builder: (yargs) => yargs
            .positional('schema', {
                describe: 'Schema path',
                type: 'string'
            })
            .positional('destination', {
                describe: 'Output file or directory',
                type: 'string',
                default: '.',
                defaultDescription: '(Current directory)'
            })
            .option('package', {
                alias: 'p',
                describe: 'The package name for the generated code',
                type: 'string',
                default: ''
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
            const inputFile = readSchemaFile(argv.schema)
            const outputStream = getFileOutputStream(argv.destination, inputFile.name + ".kt")

            global.schema = parseSchema(inputFile.schema)
            global.printer = new Printer(outputStream)
            global.options = {
                serializerEnabled: argv.serializer,
                deserializerEnabled: argv.deserializer,
                package: argv.package
            }

            printTypes()
            outputStream.end()
        }
    })
    .command({
        command: 'schema [destination]',
        describe: 'Outputs the JSON schema for buffela schemata',
        builder: (yargs) => yargs.positional('destination', {
            describe: 'The output file or directory',
            type: 'string',
            default: '.',
            defaultDescription: '(Current directory)'
        }),
        handler: (argv) => {
            const outputStream = getFileOutputStream(argv.destination, "buffela-schema.json")
            outputStream.write(JSON.stringify(editorSchema, null, 2))
            outputStream.end()
        }
    })
    .strict()
    .demandCommand(1)
    .help()
    .parse(hideBin(process.argv))