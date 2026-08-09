export default class RootTypeParser {
    #parsers = []

    addParser(parser) {
        this.#parsers.push(parser)
    }

    parse(schema, name, definition) {
        let index = 0

        const next = () => {
            const parser = this.#parsers[index++]
            parser(schema, name, definition, next)
        }

        next()
    }
}