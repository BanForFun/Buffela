import FieldTypeParser from './FieldTypeParser.js';

class Dimension {
    sizeType;
    optional = false;

    constructor(sizeType) {
        this.sizeType = sizeType;
    }
}

const KIND_ANY = 0
const KIND_CONCRETE = 1
const KIND_PRIMITIVE = 2

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
            const sizeType = InstantiatedType.#parseNested(schema, parser, KIND_PRIMITIVE)
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

        const type = InstantiatedType.#parseNested(schema, parser, KIND_PRIMITIVE)
        if (!parser.tryConsume(')'))
            throw new Error('Expected closing parenthesis')

        return type
    }

    static #parseElementType(schema, typeName, kind) {
        if (typeof typeName !== 'string')
            return new InstantiatedType(typeName)

        switch(kind) {
            case KIND_ANY:
                const aliasDefinition = schema.instantiatedAliases[typeName]
                if (aliasDefinition)
                    return InstantiatedType.#parse(schema, aliasDefinition, KIND_CONCRETE)

                //Fallthrough
            case KIND_CONCRETE:
                const complexType = schema[typeName]
                if (complexType)
                    return new InstantiatedType(complexType)

                //Fallthrough
            case KIND_PRIMITIVE:
                const primitiveType = schema.lookupPrimitive(typeName)
                return new InstantiatedType(primitiveType)
        }
    }

    static #parseNested(schema, parser, _kind) {
        const typeName = parser.consumeName()
        if (typeName == null) return null

        const argumentType = InstantiatedType.#parseArgumentType(schema, parser)
        const kind = argumentType !== undefined ? KIND_PRIMITIVE : _kind

        const elementType = InstantiatedType.#parseElementType(schema, typeName, kind)
        elementType.#consumeSuffix(schema, parser)
        if (argumentType !== undefined)
            elementType.argument = argumentType

        return elementType
    }

    static #parse(schema, definition, kind) {
        const parser = new FieldTypeParser(definition)
        const type = InstantiatedType.#parseNested(schema, parser, kind)
        if (!type) throw new Error('Invalid type prefix')

        if (!parser.completed)
            throw new Error('Invalid type suffix')

        return type;
    }

    static parse(schema, definition) {
        return InstantiatedType.#parse(schema, definition, KIND_ANY)
    }
}