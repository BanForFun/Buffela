export default class ComplexType {
    //TODO: Make bit field
    static #getMinSizeType(count) {
        if (count <= 255) {
            return "UByte"
        } else if (count <= 65535) {
            return "UShort"
        } else if (count <= 2147483647) {
            return "Int"
        } else {
            throw new Error("Fuck off")
        }
    }

    #schema;

    constructor(schema, kind, name) {
        this.#schema = schema;

        Object.defineProperty(this, 'kind', { value: kind })
        Object.defineProperty(this, 'name', { value: name })
    }

    setSize(size) {
        if (size <= 1) return;

        Object.defineProperty(this, 'defaultArgument', {
            value: this.#schema.lookupType(ComplexType.#getMinSizeType(size)),
            configurable: true
        })
    }
}