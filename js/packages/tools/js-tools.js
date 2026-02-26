const process = require("node:process");
const path = require("path");
const yargs = require('yargs')
const { hideBin } = require("yargs/helpers");
const { readSchemaFile, getFileOutputStream, Printer, existsDirSync} = require('@buffela/tools-common')
const { parseSchema } = require("@buffela/parser");
const { printTypes } = require("./utils/typeUtils");

yargs()
    .command({
        command: '* <schema> [rootDir]',
        describe: 'Converts buffela schemata to JSON and generates type definitions',
        builder: (yargs) => yargs
            .positional('schema', {
                describe: 'Schema path',
                type: 'string'
            })
            .positional('rootDir', {
                describe: 'Root output directory',
                type: 'string',
                default: '.',
                defaultDescription: '(Current directory)'
            })
            .option('json', {
                alias: 'j',
                describe: 'Json output file or directory (relative to rootDir)',
                type: 'string',
                default: '.'
            })
            .option('types', {
                alias: 't',
                describe: 'Type output file or directory (relative to rootDir)',
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
            if (!existsDirSync(argv.rootDir)) {
                console.error('rootDir is not a valid directory')
                process.exit(1)
            }

            const inputFile = readSchemaFile(argv.schema)

            if (argv.json) {
                const jsonPath = path.resolve(argv.rootDir, argv.json)
                const jsonStream = getFileOutputStream(jsonPath, inputFile.name + ".json")
                jsonStream.write(JSON.stringify(inputFile.schema, null, 2))
                jsonStream.end()
            }

            if (argv.types) {
                const typesPath = path.resolve(argv.rootDir, argv.types)
                const typesStream = getFileOutputStream(typesPath, inputFile.name + ".ts")

                global.schema = parseSchema(inputFile.schema)
                global.printer = new Printer(typesStream)
                global.options = { serializerEnabled: argv.serializer, deserializerEnabled: argv.deserializer }

                printTypes()
                typesStream.end()
            }
        }
    })
    .demandCommand(1)
    .help()
    .parse(hideBin(process.argv))