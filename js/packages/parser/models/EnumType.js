import {inspectSymbol} from "../constants/symbols.js";

import Type from "./Type.js";

export default class EnumType extends Type {
    #definition;
    #schema;

    constructor(schema, argument, definition, name) {
        super(schema, argument, 'enum');

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
        this.autoSizeParam(this.#definition.length)

        Object.setPrototypeOf(this, this.#schema.enumPrototype)
    }
}