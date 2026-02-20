import {inspectSymbol} from "../constants/symbols.js";

import ComplexType from "./ComplexType.js";

export default class EnumType extends ComplexType {
    #definition;
    #schema;

    constructor(schema, definition, name) {
        super(schema, 'enum', name);

        this[inspectSymbol] = () => `<BuffelaEnum ${name}>`
        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'entries', { value: [], writable: true })
    }

    link() {
        const entries = []
        for (let index = 0; index < this.#definition.length; index++) {
            const value = this.#definition[index];
            const entry = {
                index,
                [inspectSymbol]: () =>  `<BuffelaEnumValue ${value}>`
            }

            this[value] = entry
            entries[index] = entry
        }

        this.entries = entries;
        this.setSize(this.#definition.length)

        Object.setPrototypeOf(this, this.#schema.enumExtensions)
    }
}