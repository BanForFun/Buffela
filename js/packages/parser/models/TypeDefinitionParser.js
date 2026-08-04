export default class DefinitionParser {
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