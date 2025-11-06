function printEnumCalfClass(calf) {
    printer.blockStart(`enum class ${calf.name} {`)

    for (const {name} of calf.values)
        printer.line(`${name},`)

    printer.blockEnd('}')
}

module.exports = { printEnumCalfClass }