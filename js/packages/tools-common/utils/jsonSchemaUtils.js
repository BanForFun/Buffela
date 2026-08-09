function ifThen(heuristic, full) {
    return { "if": heuristic, "then": full }
}

function when(cases, fallback) {
    return cases.reduceRight((fallback, schema) => {
        return { ...schema, "else": fallback }
    }, fallback)
}

function fail(message) {
    return { "not": {}, "errorMessage": message }
}

function oneOf(schemas) {
    return { "oneOf": schemas }
}

function suggestions(strings) {
    return {
        "type": "string",
        "pattern": "[]",
        "enum": strings
    }
}

module.exports = {
    ifThen,
    when,
    fail,
    oneOf,
    suggestions
}