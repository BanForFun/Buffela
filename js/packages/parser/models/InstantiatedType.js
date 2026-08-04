class DefinitionParser {
    #definition;
    #pattern = /((?<number>\d+)|[A-Z][a-zA-Z\d]*)?/y;

    constructor(definition) {
        this.#definition = definition;
    }

    consumeName() {
        const matches = this.#pattern.exec(this.#definition);
        const fullMatch = matches[0]
        if (!fullMatch) return null;

        const { number } = matches.groups;
        return number ? +number : fullMatch;
    }

    tryConsume(character) {
        const consumed = this.#definition[this.#pattern.lastIndex] === character
        if (consumed) this.#pattern.lastIndex++

        return consumed;
    }

    get completed() {
        return this.#pattern.lastIndex === this.#definition.length
    }
}

class Dimension {
    sizeType;
    optional = false;

    constructor(sizeType) {
        this.sizeType = sizeType;
    }
}

export default class InstantiatedType {
    element;
    argument = null;
    optional = false;
    dimensions = []

    constructor(element) {
        this.element = element;
    }

    #consumeSuffix(schema, parser) {
        if (parser.tryConsume('?')) {
            // Don't assign tryConsume to optional; For aliases we want the type to be optional if either
            // the definition or the usage is
            this.optional = true
        }

        while(parser.tryConsume('[')) {
            const sizeType = InstantiatedType.#parseNested(schema, parser, true)
            if (!sizeType) throw new Error("Expected type")

            const dimension = new Dimension(sizeType)
            this.dimensions.push(dimension)

            if (!parser.tryConsume(']'))
                throw new Error("Expected closing square brackets")

            dimension.optional = parser.tryConsume('?')
        }
    }

    static #parseArgumentType(schema, parser) {
        if (!parser.tryConsume('('))
            return undefined // No parenthesis at all, not even empty

        const type = InstantiatedType.#parseNested(schema, parser, true)

        if (!parser.tryConsume(')'))
            throw new Error('Expected closing parenthesis')

        return type
    }

    static #parseElementType(schema, typeName, forcePrimitive, hasArgument) {
        if (typeof typeName === 'number')
            return new InstantiatedType(typeName)

        if (!forcePrimitive) {
            const aliasDefinition = schema.lookupAlias(typeName)
            if (aliasDefinition)
                return InstantiatedType.#parse(schema, aliasDefinition, true)

            const complexType = schema[typeName]
            if (complexType)
                return new InstantiatedType(complexType)
        }

        const primitive = schema.lookupPrimitive(typeName)
        if (hasArgument) {
            primitive.usedWithArgument = true
        } else {
            primitive.usedWithoutArgument = true
        }

        return new InstantiatedType(primitive)
    }

    static #parseNested(schema, parser, _forcePrimitive) {
        const typeName = parser.consumeName()
        if (typeName == null) return null

        // Type -> undefined
        // Type() -> null
        // Type(Size) -> Size
        const argumentType = InstantiatedType.#parseArgumentType(schema, parser)
        const forcePrimitive = _forcePrimitive || argumentType !== undefined
        const hasArgument = argumentType != null

        const elementType = InstantiatedType.#parseElementType(schema, typeName, forcePrimitive, hasArgument)
        elementType.#consumeSuffix(schema, parser)
        if (argumentType !== undefined)
            elementType.argument = argumentType

        return elementType
    }

    static #parse(schema, definition, forcePrimitive) {
        const parser = new DefinitionParser(definition)
        const type = InstantiatedType.#parseNested(schema, parser, forcePrimitive)
        if (!type) throw new Error('Invalid type prefix')

        if (!parser.completed)
            throw new Error('Invalid type suffix')

        return type;
    }

    static parse(schema, definition) {
        return InstantiatedType.#parse(schema, definition, false)
    }
}