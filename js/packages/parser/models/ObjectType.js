import {inspectSymbol} from "../constants/symbols.js";

import FieldType from "./FieldType.js";
import Type from "./Type.js";

class ObjectSubtype extends Type {
    #definition;
    #schema;

    constructor(schema, param, definition, inspectName) {
        super(schema, param, 'object');

        this[inspectSymbol] = () => `<BuffelaSubtype ${inspectName}>`
        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'fields', { value: {}, writable: true })
        Object.defineProperty(this, 'parent', { value: null, writable: true })

        Object.defineProperty(this, 'isRoot', {
            get() {
                return this.parent === null
            }
        })

        Object.defineProperty(this, 'isLeaf', {
            get() {
                return this.leafIndex !== undefined
            }
        })

        Object.defineProperty(this, 'isAbstract', {
            get() {
                return !!this.param // Users may force a type to be abstract by giving a size argument
            }
        })
    }

    #linkFields(fieldScope) {
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

        this.fields = fields
        Object.assign(fieldScope, fields);
    }

    #linkSubtypes(fieldScope, leaves) {
        for (const key in this.#definition) {
            const member = this.#definition[key]
            if (typeof member !== 'object') continue;

            const { name, param } = this.#schema.parseParameterizedName(key)
            const subtype = new ObjectSubtype(this.#schema, param, member, name)
            subtype.link(this, leaves, fieldScope)

            this[name] = subtype
        }

        const subtypeCount = Object.keys(this).length
        if (subtypeCount === 0) {
            Object.defineProperty(this, 'leafIndex', { value: leaves.length, configurable: true })
            leaves.push(this)
        } else {
            this.autoSizeParam(subtypeCount)
        }
    }

    link(parent, leaves, fieldScope = {}) {
        this.parent = parent;
        this.#linkFields(fieldScope);
        this.#linkSubtypes(fieldScope, leaves);

        Object.setPrototypeOf(this, this.#schema.objectPrototype)
    }
}

export default class ObjectType extends ObjectSubtype {
    constructor(schema, param, definition, inspectName) {
        super(schema, param, definition, inspectName);

        this[inspectSymbol] = () => `<BuffelaObject ${inspectName}>`
    }

    link() {
        Object.defineProperty(this, 'leaves', { value: [], configurable: true })
        super.link(null, this.leaves)
    }
}