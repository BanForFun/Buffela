export function validateCustomPrimitiveConfiguration(name, configuration, primitive) {
    const { argument } = configuration;
    if (!argument) {
        throw new Error(`No argument configuration provided for type '${name}'. ` +
            "If your type does not need an argument, you can set argument to 'none'.")
    }

    if (argument === 'none') {
        if (primitive.usedWithArgument)
            throw new Error(`Type '${name}' does not take arguments`)

        return
    }

    if (!argument.endsWith("?") && primitive.usedWithoutArgument) {
        throw new Error(`Type '${name}' needs an argument`)
    }
}