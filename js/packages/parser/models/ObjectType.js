import {inspectSymbol} from "../constants/symbols.js";

import ComplexType from "./ComplexType.js";
import InstantiatedType from "./InstantiatedType.js";

export default class ObjectType extends ComplexType {
    #definition;
    #schema;

    constructor(schema, definition, name) {
        super(schema, 'object', name);

        this[inspectSymbol] = () => `<BuffelaObject ${name}>`
        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'ownFields', { value: {}, writable: true })
        Object.defineProperty(this, 'fieldOverrides', { value: {}, writable: true })
        Object.defineProperty(this, 'parent', { value: null, writable: true })

        Object.defineProperty(this, 'isRoot', {
            get() {
                return this.leaves !== undefined
            }
        })

        Object.defineProperty(this, 'isInternal', {
            get() {
                return this.leafRangeEnd !== undefined
            }
        })

        Object.defineProperty(this, 'isLeaf', {
            get() {
                return this.leafIndex !== undefined
            }
        })
    }

    #isLeaf() {
        // noinspection LoopStatementThatDoesntLoopJS
        for (const _ in this)
            return false

        return true
    }

    #finalize() {
        Object.setPrototypeOf(this, this.#schema.objectExtensions)
    }

    #linkFields(fieldScope) {
        const fieldOverrides = {}
        const ownFields = {}

        for (const name in this.#definition) {
            const member = this.#definition[name]
            if (typeof member !== 'string') continue;

            const field = {
                final: true,
                type: InstantiatedType.parse(this.#schema, member)
            }

            const overriddenField = fieldScope[name]
            if (overriddenField) {
                overriddenField.final = false
                fieldOverrides[name] = field
            } else {
                ownFields[name] = field
            }
        }

        Object.assign(fieldScope, ownFields)

        this.ownFields = ownFields;
        this.fieldOverrides = fieldOverrides;
    }

    #linkSubtypes(fieldScope, leaves) {
        for (const name in this.#definition) {
            const member = this.#definition[name]
            if (typeof member !== 'object') continue;

            const subtype = new ObjectType(this.#schema, member, name)
            subtype.#linkAsSubtype(this, leaves, fieldScope)
            subtype.#finalize()

            this[name] = subtype
        }

        if (this.#isLeaf()) {
            Object.defineProperty(this, 'leafIndex', { value: leaves.length, configurable: true })
            leaves.push(this)
        } else {
            Object.defineProperty(this, 'leafRangeEnd', { value: leaves.length, configurable: true })
        }
    }

    #linkAsSubtype(parent, leaves, fieldScope = {}) {
        this.parent = parent;

        this.#linkFields(fieldScope);
        this.#linkSubtypes(fieldScope, leaves);
    }

    link() {
        Object.defineProperty(this, 'leaves', { value: [], configurable: true })
        this.#linkAsSubtype(null, this.leaves)

        delete this.leafRangeEnd
        this.setSize(this.leaves.length)

        this.#finalize()
    }
}