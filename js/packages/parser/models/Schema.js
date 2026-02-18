import EnumType from "./EnumType.js";
import ObjectType from "./ObjectType.js";

export default class Schema {
    static #namePattern = /^([A-Z][a-zA-Z]*)(?:\(([A-Z][a-zA-Z]*)\))?$/;

    #definition;

    constructor(definition) {
        this.#definition = definition;

        Object.defineProperty(this, 'typePrototype', { value: {} })
        Object.defineProperty(this, 'objectPrototype', { value: Object.create(this.typePrototype) })
        Object.defineProperty(this, 'enumPrototype', { value: Object.create(this.typePrototype) })

        Object.defineProperty(this, 'primitives', { value: {} })

        this.#hoistTypes()
        this.#linkTypes()
    }

    lookupPrimitive(primitiveString) {
        if (primitiveString == null) return null
        return (this.primitives[primitiveString] ??= Object.create(this.typePrototype))
    }

    lookupAlias(typeString) {
        const definition = this.#definition[typeString];
        return typeof definition === 'string' ? definition : null;
    }

    parseParameterizedName(nameString) {
        const namePatternResults = Schema.#namePattern.exec(nameString)
        if (namePatternResults == null) throw new Error('Invalid name')

        const [ _, name, primitiveArgument ] = namePatternResults
        const argument = this.lookupPrimitive(primitiveArgument)

        return { name, argument }
    }

    #hoistTypes() {
        for (const key in this.#definition) {
            const member = this.#definition[key];
            if (typeof member !== 'object') continue;

            const { name, argument } = this.parseParameterizedName(key)
            this[name] = Array.isArray(member)
                ? new EnumType(this, argument, member, name)
                : new ObjectType(this, argument, member, name)
        }
    }

    #linkTypes() {
        for (const name in this) this[name].link()
    }
}