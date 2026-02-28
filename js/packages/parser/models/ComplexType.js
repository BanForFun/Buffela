import InstantiatedType from "./InstantiatedType.js";

export default class ComplexType {
    #schema;

    constructor(schema, kind, name) {
        this.#schema = schema;

        Object.defineProperty(this, 'kind', { value: kind })
        Object.defineProperty(this, 'name', { value: name })
    }

    #getMinSizeType(size) {
        if (size <= 1) return null;

        const bits = Math.ceil(Math.log2(size)) + 1
        const type = new InstantiatedType(this.#schema.lookupType("Unsigned"))
        type.argument = new InstantiatedType(bits)

        return type
    }

    setSize(size) {
        const minSizeType = this.#getMinSizeType(size)
        Object.defineProperty(this, 'defaultArgument', { value: minSizeType, configurable: true })
    }
}