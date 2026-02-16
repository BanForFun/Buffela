export default class FieldType {
    static #typePattern = /^([A-Z][a-zA-Z]*)(?:\((?:(?<primitiveParam>[A-Z][a-zA-Z]*)|(?<constParam>\d+)\)))?/
    static #dimensionPattern = /$|\[(?:(?<primitiveLength>[A-Z][a-zA-Z]*)|(?<constLength>\d+))]/y

    final = true;
    override = false;
    name;
    dimensions;
    param;
    primitive;

    #schema;

    constructor(schema, definition) {
        this.#schema = schema;
        this.#resolve(definition);
    }

    #parseArgument(constString, primitiveString) {
        return constString != null ? +constString : this.#schema.lookupPrimitive(primitiveString)
    }

    #parse(definition) {
        const typePatternResults = FieldType.#typePattern.exec(definition)
        if (typePatternResults == null) throw new Error('Invalid type')

        const [ elementType, elementTypeName ] = typePatternResults
        const { groups: elementTypeGroups } = typePatternResults

        let lengthMatch = null
        const dimensions = []

        FieldType.#dimensionPattern.lastIndex = elementType.length
        while (lengthMatch = FieldType.#dimensionPattern.exec(definition)) {
            if (!lengthMatch[0]) break;

            const { groups } = lengthMatch
            dimensions.push(this.#parseArgument(groups.constLength, groups.primitiveLength))
        }

        if (FieldType.#dimensionPattern.lastIndex < definition.length)
            throw new Error('Invalid type suffix')

        return { elementType, elementTypeName, elementTypeGroups, dimensions }
    }

    #resolve(definition) {
        const {
            elementType,
            elementTypeName,
            elementTypeGroups,
            dimensions
        } = this.#parse(definition)

        const alias = this.#schema.lookupAlias(elementType)
        if (alias) {
            this.#resolve(definition)
            this.dimensions.push(...dimensions)
            return
        }

        this.name = elementTypeName
        this.primitive = this.#schema[elementTypeName] ?? this.#schema.lookupPrimitive(elementTypeName);
        this.param = this.#parseArgument(elementTypeGroups.constParam, elementTypeGroups.primitiveParam);
        this.dimensions = dimensions;
    }
}