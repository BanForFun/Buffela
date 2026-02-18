const process = require("node:process");
const yargs = require('yargs')
const { hideBin } = require("yargs/helpers");
const { readSchemaFile, getFileOutputStream, Printer} = require('@buffela/tools-common')
const { printTypes } = require("./utils/typeUtils");
const { parseSchema } = require("@buffela/parser");

yargs()
    .command({
        command: '* <schema>',
        describe: 'Converts buffela schemata to JSON and generates type definitions',
        builder: (yargs) => yargs
            .positional('schema', {
                describe: 'Schema path',
                type: 'string'
            })
            .option('json', {
                alias: 'j',
                describe: 'Json output file or directory',
                type: 'string',
                default: '.'
            })
            .option('types', {
                alias: 't',
                describe: 'Type output file or directory',
                type: 'string',
                default: '.'
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
            const inputFile = readSchemaFile(argv.schema)

            if (argv.json) {
                const jsonStream = getFileOutputStream(argv.json, inputFile.name + ".json")
                jsonStream.write(JSON.stringify(inputFile.schema, null, 2))
                jsonStream.end()
            }

            if (argv.types) {
                const typeStream = getFileOutputStream(argv.types, inputFile.name + ".d.ts")

                global.schema = parseSchema(inputFile.schema)
                global.printer = new Printer(typeStream)
                global.options = { serializerEnabled: argv.serializer, deserializerEnabled: argv.deserializer }

                printTypes()
                typeStream.end()
            }
        }
    })
    .demandCommand(1)
    .help()
    .parse(hideBin(process.argv))