import SchemaNode from "./SchemaNode.js";

class EnumEntry extends SchemaNode {
    constructor(parentPath, name, index) {
        super(parentPath, name);
        this.index = index;
    }
}

export default class EnumType extends SchemaNode {
    #definition;
    #schema;

    constructor(schema, parentPath, name, definition) {
        super(parentPath, name);

        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'entries', { value: [], writable: true })
    }

    link() {
        const entries = []
        for (let index = 0; index < this.#definition.length; index++) {
            const name = this.#definition[index];
            const entry = new EnumEntry(this.path, name, index);

            this[name] = entry
            entries[index] = entry
        }

        this.entries = entries;
        Object.defineProperty(this, 'entryIndexType', {
            value: this.#schema.sizeType(this.#definition.length),
            configurable: true
        });

        Object.setPrototypeOf(this, this.#schema.enumExtensions)
    }
}