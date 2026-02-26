import {standardNames, standardSerializers} from "./standardUtils.js";
import SerializerBuffer from "../models/SerializerBuffer.js";
import {serializeEnum} from "./enumUtils.js";
import {serializeObject} from "./objectUtils.js";

/**
 *
 * @this {Serializer.ComplexType}
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
 * @param {Serializer.Schema} schema
 * @param {Object.<string, CustomSerializer>} customSerializers
 */
export function registerSerializer(schema, customSerializers) {
    const unresolvedNames = new Set(Object.keys(schema.primitiveTypes))
    const customNames = new Set(Object.keys(customSerializers))

    const missingNames = Array.from(
        unresolvedNames
            .difference(standardNames)
            .difference(customNames)
    )

    if (missingNames.length > 0) {
        throw new Error('Unknown type(s): ' + missingNames.join(', '))
    }

    schema.complexExtensions.serialize = serializeComplexType

    schema.enumExtensions._serialize = serializeEnum
    schema.objectExtensions._serialize = serializeObject

    for (const name in standardSerializers) {
        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._serialize = standardSerializers[name]
        }
    }

    for (const name in customSerializers) {
        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._serialize = customSerializers[name].serialize
        }
    }
}