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

module.exports = {
    ifThen,
    when,
    fail
}