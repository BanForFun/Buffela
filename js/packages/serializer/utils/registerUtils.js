import {standardSerializers} from "./standardUtils.js";
import SerializerBuffer from "../models/SerializerBuffer.js";
import {serializeEnum} from "./enumUtils.js";
import {serializeObject} from "./objectUtils.js";

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {any} value
 * @param {SerializerTypes.InstantiatedConstSizeType | null} arg
 */
function serializeCustomPrimitive(buffer, value, arg) {
    this._doSerialize(buffer, value, arg?.element)
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
    schema.complexExtensions.serialize = serializeComplexType

    schema.enumExtensions._serialize = serializeEnum
    schema.objectExtensions._serialize = serializeObject

    for (const name in customSerializers) {
        if (name in standardSerializers)
            throw new Error(`Standard ${name} serializer cannot be overridden`)

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            const serializer = customSerializers[name]
            primitive._doSerialize = serializer.serialize
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