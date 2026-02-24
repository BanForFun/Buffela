export default class InstantiatedType {
    element;
    argument = null;
    dimensions = []

    constructor(element) {
        this.element = element;
    }

    #parseSuffix(schema, definition, pattern, isAlias) {
        const stack = []
        while (pattern.lastIndex < definition.length) {
            const character = definition[pattern.lastIndex++]

            if (character === '(') {
                this.argument = InstantiatedType.#parseNested(schema, definition, pattern, isAlias);
                stack.push(')')
            } else if (character === '[') {
                this.dimensions.push(InstantiatedType.#parseNested(schema, definition, pattern, isAlias))
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

    static #parseElementType(schema, definition, pattern, isAlias) {
        const match = pattern.exec(definition);
        if (!match) throw new Error('Invalid type prefix');

        const { 0: name, groups: { number } } = match;
        if (number) return new InstantiatedType(+number);

        const alias = isAlias ? null : schema.lookupAlias(name);
        if (alias) return InstantiatedType.#parse(schema, alias, true)

        return new InstantiatedType(schema.lookupType(name))
    }

    static #parseNested(schema, definition, pattern, isAlias) {
        const type = InstantiatedType.#parseElementType(schema, definition, pattern, isAlias);
        type.#parseSuffix(schema, definition, pattern, isAlias);

        return type;
    }

    static #parse(schema, definition, isAlias) {
        const pattern = /(?<number>\d+)|[A-Z][a-zA-Z\d]*/y
        const type = InstantiatedType.#parseNested(schema, definition, pattern, isAlias);

        if (pattern.lastIndex !== definition.length)
            throw new Error('Invalid type suffix')

        return type;
    }

    static parse(schema, definition) {
        return InstantiatedType.#parse(schema, definition, false)
    }
}