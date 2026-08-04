import {standardSerializers} from "./standardUtils.js";
import SerializerBuffer from "../models/SerializerBuffer.js";
import {serializeEnum} from "./enumUtils.js";
import {serializeObject} from "./objectUtils.js";
import {serializePrimitiveSize} from "./typeUtils.js"

const standardNames = new Set(Object.keys(standardSerializers))

class InstantiatedPrimitiveSizeAdapter {
    /**
     * @type {SerializerTypes.InstantiatedPrimitiveSizeType}
     */
    #argument;

    constructor(argument) {
        this.#argument = argument;
    }

    /**
     *
     * @param {SerializerBuffer} buffer
     * @param {unknown} value
     */
    serialize(buffer, value) {
        serializePrimitiveSize(buffer, this.#argument, value)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {any} value
 * @param {SerializerTypes.InstantiatedSizeType | null} arg
 */
function serializeCustomPrimitive(buffer, value, arg) {
    if (arg == null) {
        this._serializer.serialize(buffer, value)
    } else if (typeof arg.element === "object") {
        this._serializer.serialize(buffer, value, new InstantiatedPrimitiveSizeAdapter(arg).serialize)
    } else {
        this._serializer.serialize(buffer, value, arg.element)
    }
}

/**
 *
 * @this {SerializerExtensions}
 * @param {unknown} value
 * @param {SerializerBuffer} [buffer]
 */
function serializeComplexType(value, buffer) {
    if (buffer) {
        this._serialize(buffer, value, null)
    } else {
        buffer = new SerializerBuffer()
        this._serialize(buffer, value, null)
        return buffer.toBytes()
    }
}

/**
 *
 * @param {SerializerTypes.Schema} schema
 * @param {Object.<string, CustomSerializer>} customSerializers
 */
export function registerSerializer(schema, customSerializers) {
    const customNames = new Set(Object.keys(customSerializers))
    const missingNames = Array.from(
        new Set(Object.keys(schema.primitiveTypes))
            .difference(standardNames)
            .difference(customNames)
    )

    if (missingNames.length > 0) {
        throw new Error('Unknown type(s): ' + missingNames.join(', '))
    }

    schema.complexExtensions.serialize = serializeComplexType

    schema.enumExtensions._serialize = serializeEnum
    schema.objectExtensions._serialize = serializeObject

    for (const name in customSerializers) {
        if (name in standardSerializers)
            throw new Error(`Standard ${name} serializer cannot be overridden`)

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            const serializer = customSerializers[name]

            if (serializer.argument === 'none' && primitive.usedWithArgument)
                throw new Error(`Type '${name}' does not take arguments`)

            if (serializer.argument === 'required' && primitive.usedWithoutArgument)
                throw new Error(`Type '${name}' needs an argument`)

            primitive._serializer = serializer
            primitive._serialize = serializeCustomPrimitive
        }
    }

    for (const name in standardSerializers) {
        if (name in customSerializers) continue

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._serialize = standardSerializers[name]
        }
    }
}