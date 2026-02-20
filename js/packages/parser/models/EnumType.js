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

        Object.defineProperty(this, 'values', { value: [], writable: true })
    }

    link() {
        for (let index = 0; index < this.#definition.length; index++) {
            const value = this.#definition[index];

            this[value] = {
                index,
                [inspectSymbol]: () =>  `<BuffelaEnumValue ${value}>`
            }
        }

        this.values = [...this.#definition]
        this.setSize(this.#definition.length)

        Object.setPrototypeOf(this, this.#schema.enumExtensions)
    }
}