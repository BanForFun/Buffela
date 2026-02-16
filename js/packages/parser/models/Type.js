export default class Type {
    static #getAutoSizePrimitive(count) {
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

    constructor(schema, param, kind) {
        this.#schema = schema;

        Object.defineProperty(this, 'kind', { value: kind })
        Object.defineProperty(this, 'param', { value: param, writable: true })
    }

    autoSizeParam(count) {
        this.param ??= this.#schema.lookupPrimitive(Type.#getAutoSizePrimitive(count))
    }
}