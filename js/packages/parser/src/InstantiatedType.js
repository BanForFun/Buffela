import FieldTypeParser from './FieldTypeParser.js';

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
            if (!sizeType) throw new Error("Expected size")

            const dimension = new Dimension(sizeType)
            this.dimensions.push(dimension)

            if (!parser.tryConsume(']'))
                throw new Error("Expected closing square brackets")

            dimension.optional = parser.tryConsume('?')
        }
    }

    // Type -> undefined
    // Type() -> null
    // Type(Size) -> Size
    static #parseArgumentType(schema, parser) {
        if (!parser.tryConsume('('))
            return undefined

        const type = InstantiatedType.#parseNested(schema, parser, true)

        if (!parser.tryConsume(')'))
            throw new Error('Expected closing parenthesis')

        return type
    }

    static #parseElementType(schema, typeName, forcePrimitive) {
        if (typeof typeName !== 'string')
            return new InstantiatedType(typeName)

        if (!forcePrimitive) {
            const aliasDefinition = schema.primitiveAliases[typeName]
            if (aliasDefinition)
                return InstantiatedType.#parse(schema, aliasDefinition, true)

            const complexType = schema[typeName]
            if (complexType)
                return new InstantiatedType(complexType)
        }

        const primitive = schema.lookupPrimitive(typeName)
        return new InstantiatedType(primitive)
    }

    static #parseNested(schema, parser, _forcePrimitive) {
        const typeName = parser.consumeName()
        if (typeName == null) return null

        const argumentType = InstantiatedType.#parseArgumentType(schema, parser)
        const forcePrimitive = _forcePrimitive || argumentType !== undefined

        const elementType = InstantiatedType.#parseElementType(schema, typeName, forcePrimitive)
        elementType.#consumeSuffix(schema, parser)
        if (argumentType !== undefined)
            elementType.argument = argumentType

        return elementType
    }

    static #parse(schema, definition, forcePrimitive) {
        const parser = new FieldTypeParser(definition)
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