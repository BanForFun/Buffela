import EnumType from "./EnumType.js";
import ObjectType from "./ObjectType.js";
import SchemaNode from "./SchemaNode.js";
import RootTypeParser from "./RootTypeParser.js";
import InstantiatedType from "./InstantiatedType.js";
import PrimitiveType from "./PrimitiveType.js";

const aliasParser = new RootTypeParser()

aliasParser.addParser(function(schema, name, definition, next) {
    const match = /^Primitive\(([A-Z][a-zA-Z]*)?(\?)?\)$/.exec(definition)
    if (!match) return next()

    schema.primitiveDeclarations[name] = {
        parameterType: match[1] ?? null,
        optional: !!match[2]
    }
})

aliasParser.addParser(function (schema, name, definition) {
    schema.primitiveAliases[name] = definition;
})

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
        Object.defineProperty(this, 'primitiveDeclarations', { value: {} })
        Object.defineProperty(this, 'primitiveAliases', { value: {} })

        this.#hoistTypes()
        this.#linkTypes()
    }

    sizeType(size) {
        if (size <= 1) return null

        const bits = Math.floor(Math.log2(size - 1)) + 1
        const sizeType = new InstantiatedType(this.lookupPrimitive("UInt"))
        sizeType.argument = new InstantiatedType(bits)

        return sizeType
    }

    lookupPrimitive(name) {
        return this.primitiveTypes[name] ??= PrimitiveType(name)
    }

    #hoistTypes() {
        for (const name in this.#definition) {
            const definition = this.#definition[name];
            switch (typeof definition) {
                case 'object':
                    this[name] = Array.isArray(definition)
                        ? new EnumType(this, [], name, definition)
                        : new ObjectType(this, [], name, definition)

                    break;
                case 'string':
                    aliasParser.parse(this, name, definition)
                    break;
            }
        }
    }

    #linkTypes() {
        for (const name in this) this[name].link()
    }
}
