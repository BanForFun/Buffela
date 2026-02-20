import EnumType from "./EnumType.js";
import ObjectType from "./ObjectType.js";

export default class Schema {
    #definition;

    constructor(definition) {
        this.#definition = definition;

        Object.defineProperty(this, 'userExtensions', { value: {} })
        Object.defineProperty(this, 'objectExtensions', { value: Object.create(this.userExtensions) })
        Object.defineProperty(this, 'enumExtensions', { value: Object.create(this.userExtensions) })

        Object.defineProperty(this, 'primitiveTypes', { value: {} })

        this.#hoistTypes()
        this.#linkTypes()
    }

    lookupType(name) {
        return this[name] ?? (this.primitiveTypes[name] ??= { name })
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
                ? new EnumType(this, member, name)
                : new ObjectType(this, member, name)
        }
    }

    #linkTypes() {
        for (const name in this) this[name].link()
    }
}