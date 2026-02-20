export default class InstantiatedType {
    element;
    argument = null;
    dimensions = []

    constructor(element) {
        this.element = element;
    }

    #parseSuffix(schema, definition, pattern) {
        const stack = []
        while (pattern.lastIndex < definition.length) {
            const character = definition[pattern.lastIndex++]

            if (character === '(') {
                this.argument = InstantiatedType.#parse(schema, definition, pattern);
                stack.push(')')
            } else if (character === '[') {
                this.dimensions.push(InstantiatedType.#parse(schema, definition, pattern))
                stack.push(']')
            } else if (stack.length === 0) {
                pattern.lastIndex--; //Didn't actually consume any characters, roll back index
                return
            } else if (character === stack[stack.length - 1]) {
                stack.pop()
            } else {
                throw new Error(`Unexpected character '${character}'`)
            }
        }

        if (stack.length > 0) throw new Error('Non matching brackets')
    }

    static #parseElementType(schema, definition, pattern) {
        const match = pattern.exec(definition);
        if (!match) throw new Error('Invalid type prefix');

        const { 0: name, groups: { number } } = match;
        if (number) return new InstantiatedType(+number);

        const alias = schema.lookupAlias(name);
        if (alias) return InstantiatedType.parse(schema, alias)

        return new InstantiatedType(schema.lookupType(name))
    }

    static #parse(schema, definition, pattern) {
        const type = InstantiatedType.#parseElementType(schema, definition, pattern);
        type.#parseSuffix(schema, definition, pattern)

        return type;
    }

    static parse(schema, definition) {
        const pattern = /(?<number>\d+)|[A-Z][a-zA-Z\d]*/y
        const type = InstantiatedType.#parse(schema, definition, pattern)

        if (pattern.lastIndex !== definition.length)
            throw new Error('Invalid type suffix')

        return type;
    }
}