import InstantiatedType from "./InstantiatedType.js";
import SchemaNode from "./SchemaNode.js";

export default class ObjectType extends SchemaNode {
    #definition;
    #schema;

    constructor(schema, parentPath, name, definition) {
        super(parentPath, name);

        this.#definition = definition;
        this.#schema = schema;

        Object.defineProperty(this, 'ownFields', { value: {}, writable: true })

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

    #finalize() {
        Object.setPrototypeOf(this, this.#schema.objectExtensions)
    }

    #linkFields(fieldScope) {
        for (const name in this.#definition) {
            const member = this.#definition[name]
            if (typeof member !== 'string') continue;

            const field = {
                final: true,
                override: false,
                type: InstantiatedType.parse(this.#schema, member)
            }

            const overriddenField = fieldScope[name]
            if (overriddenField) {
                overriddenField.final = false
                field.override = true
            }

            this.ownFields[name] = field
        }

        Object.assign(fieldScope, this.ownFields)
    }

    #linkSubtypes(leaves, fieldScope) {
        let isLeaf = true

        for (const name in this.#definition) {
            const member = this.#definition[name]
            if (typeof member !== 'object') continue;

            const subtype = new ObjectType(this.#schema, this.path, name, member)
            subtype.#linkAsSubtype(leaves, { ...fieldScope })
            subtype.#finalize()
            this[name] = subtype

            isLeaf = false
        }

        if (isLeaf) {
            Object.defineProperty(this, 'allFields', { value: fieldScope, configurable: true })
            Object.defineProperty(this, 'leafIndex', { value: leaves.length, configurable: true })
            leaves.push(this)
        } else {
            Object.defineProperty(this, 'leafRangeEnd', { value: leaves.length, configurable: true })
        }
    }

    #linkAsSubtype(leaves, fieldScope) {
        this.#linkFields(fieldScope);
        this.#linkSubtypes(leaves, fieldScope);
    }

    link() {
        Object.defineProperty(this, 'leaves', { value: [], configurable: true })
        this.#linkAsSubtype(this.leaves, {})

        delete this.leafRangeEnd
        Object.defineProperty(this, 'leafIndexType', {
            value: this.#schema.sizeType(this.leaves.length),
            configurable: true
        })

        this.#finalize()
    }
}