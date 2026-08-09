
const pattern = /^Primitive\(([A-Z][a-zA-Z]*)?(\?)?\)$/

export function parsePrimitiveDeclaration(schema, name, definition, next) {
    const match = pattern.exec(definition)
    if (!match) return next()

    schema.primitiveDeclarations[name] = {
        parameterType: match[1] ?? null,
        optional: !!match[2]
    }
}