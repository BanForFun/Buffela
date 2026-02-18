import {inspectSymbol} from "../constants/symbols.js";

import FieldType from "./FieldType.js";
import Type from "./Type.js";

class ObjectSubtype extends Type {
    #definition;
    #schema;

    constructor(schema, argument, definition, name) {
        super(schema, argument, 'object');

        this[inspectSymbol] = () => `<BuffelaSubtype ${name}>`
        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'metadataPrefix', { value: `${name}_` })
        Object.defineProperty(this, 'fields', { value: {}, writable: true })
        Object.defineProperty(this, 'deferredFields', { value: {}, writable: true })
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

    #parseFields(fieldScope) {
        const fields = {}

        for (const key in this.#definition) {
            const member = this.#definition[key]
            if (typeof member !== 'string') continue;

            const field = new FieldType(this.#schema, member)
            const overriddenField = fieldScope[key]
            if (overriddenField) {
                overriddenField.final = false
                field.override = true
            }

            fields[key] = field
        }

        Object.assign(fieldScope, fields);

        return fields;
    }

    #isLeaf() {
        // noinspection LoopStatementThatDoesntLoopJS
        for (const _ in this)
            return false

        return true
    }

    #linkSubtypes(fieldScope, leaves) {
        for (const key in this.#definition) {
            const member = this.#definition[key]
            if (typeof member !== 'object') continue;

            const { name, argument } = this.#schema.parseParameterizedName(key)
            const subtype = new ObjectSubtype(this.#schema, argument, member, name)
            subtype.link(this, leaves, fieldScope)

            this[name] = subtype
        }

        if (this.#isLeaf()) {
            Object.defineProperty(this, 'leafIndex', { value: leaves.length, configurable: true })
            leaves.push(this)
        } else {
            Object.defineProperty(this, 'leafRangeEnd', { value: leaves.length, configurable: true })
        }
    }

    link(parent, leaves, fieldScope = {}) {
        this.parent = parent;

        const fields = this.#parseFields(fieldScope);
        this.#linkSubtypes(fieldScope, leaves);

        for (const fieldName in fields) {
            const field = fields[fieldName];
            if (!field.final && !field.override) {
                this.deferredFields[fieldName] = field;
            } else {
                this.fields[fieldName] = field;
            }
        }
    }
}

export default class ObjectType extends ObjectSubtype {
    #schema;

    constructor(schema, argument, definition, name) {
        super(schema, argument, definition, name);

        this.#schema = schema;
        this[inspectSymbol] = () => `<BuffelaObject ${name}>`
    }

    link() {
        Object.defineProperty(this, 'leaves', { value: [], configurable: true })
        super.link(null, this.leaves)

        delete this.leafRangeEnd
        this.autoSizeParam(this.leaves.length)

        Object.setPrototypeOf(this, this.#schema.objectPrototype)
    }
}