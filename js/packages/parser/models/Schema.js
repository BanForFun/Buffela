import EnumType from "./EnumType.js";
import ObjectType from "./ObjectType.js";

export default class Schema {
    static #namePattern = /^([A-Z][a-zA-Z]*)(?:\(([A-Z][a-zA-Z]*)\))?$/;

    #definition;

    constructor(definition) {
        this.#definition = definition;

        Object.defineProperty(this, 'objectPrototype', { value: {} })
        Object.defineProperty(this, 'enumPrototype', { value: {} })
        Object.defineProperty(this, 'primitives', { value: {} })

        // Object.defineProperty(this, 'types', { value: this })

        this.#hoistTypes()
        this.#linkTypes()
    }

    lookupPrimitive(primitiveString) {
        if (primitiveString == null) return null
        return (this.primitives[primitiveString] ??= {})
    }

    lookupAlias(typeString) {
        const definition = this.#definition[typeString];
        return typeof definition === 'string' ? definition : null;
    }

    parseParameterizedName(nameString) {
        const namePatternResults = Schema.#namePattern.exec(nameString)
        if (namePatternResults == null) throw new Error('Invalid name')

        const [ _, name, primitiveParam ] = namePatternResults
        const param = this.lookupPrimitive(primitiveParam)

        return { name, param }
    }

    #hoistTypes() {
        for (const key in this.#definition) {
            const member = this.#definition[key];
            if (typeof member !== 'object') continue;

            const { name, param } = this.parseParameterizedName(key)
            this[name] = Array.isArray(member)
                ? new EnumType(this, param, member, name)
                : new ObjectType(this, param, member, name)
        }
    }

    #linkTypes() {
        for (const name in this) this[name].link()
    }
}