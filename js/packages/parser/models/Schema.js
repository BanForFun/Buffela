import EnumType from "./EnumType.js";
import ObjectType from "./ObjectType.js";
import SchemaNode from "./SchemaNode.js";
import InstantiatedType from "./InstantiatedType.js";

const primitivePrototype = { kind: 'primitive' }

function createPrimitive(name) {
    const primitive = Object.create(primitivePrototype)
    primitive.name = name

    return primitive
}

export default class Schema {
    #definition;

    constructor(definition) {
        this.#definition = definition;

        const complexExtensions = Object.create(SchemaNode.prototype)
        const objectExtensions = Object.create(complexExtensions, { kind: { value: 'object' } })
        const enumExtensions = Object.create(complexExtensions, { kind: { value: 'enum' } })

        Object.defineProperty(this, 'complexExtensions', { value: complexExtensions })
        Object.defineProperty(this, 'objectExtensions', { value: objectExtensions })
        Object.defineProperty(this, 'enumExtensions', { value: enumExtensions })

        Object.defineProperty(this, 'primitiveTypes', { value: {} })

        this.#hoistTypes()
        this.#linkTypes()
    }

    sizeType(size) {
        if (size <= 1) return new InstantiatedType(0);

        const bits = Math.ceil(Math.log2(size)) + 1
        const sizeType = new InstantiatedType(this.lookupType("Unsigned"))
        sizeType.argument = new InstantiatedType(bits)

        return sizeType
    }

    lookupType(name) {
        return this[name] ?? (this.primitiveTypes[name] ??= createPrimitive(name))
    }

    lookupAlias(name) {
        const definition = this.#definition[name];
        return typeof definition === 'string' ? definition : null;
    }

    #hoistTypes() {
        for (const name in this.#definition) {
            const member = this.#definition[name];
            if (typeof member !== 'object') continue;

            this[name] = Array.isArray(member)
                ? new EnumType(this, [], name, member)
                : new ObjectType(this, [], name, member)
        }
    }

    #linkTypes() {
        for (const name in this) this[name].link()
    }
}