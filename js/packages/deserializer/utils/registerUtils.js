import {standardDeserializers, standardNames} from "./standardUtils.js";
import {deserializeEnum} from "./enumUtils.js";
import DeserializerBuffer from "../models/DeserializerBuffer.js";
import {deserializeObject} from "./objectUtils.js";


/**
 *
 * @this {Deserializer.ComplexType}
 * @param {DeserializerBuffer | Buffer} buffer
 * @return {unknown}
 */
function deserializeComplexType(buffer) {
    if (buffer instanceof DeserializerBuffer) {
        return this._deserialize(buffer, null)
    } else if (Buffer.isBuffer(buffer)) {
        const deserializerBuffer = new DeserializerBuffer(buffer)
        return this._deserialize(deserializerBuffer, null)
    }
}

/**
 *
 * @param {Deserializer.Schema} schema
 * @param {Object.<string, CustomDeserializer>} customDeserializers
 */
export function registerDeserializer(schema, customDeserializers) {
    const unresolvedNames = new Set(Object.keys(schema.primitiveTypes))
    const customNames = new Set(Object.keys(customDeserializers))

    const missingNames = Array.from(
        unresolvedNames
            .difference(standardNames)
            .difference(customNames)
    )

    if (missingNames.length > 0) {
        throw new Error('Unknown type(s): ' + missingNames.join(', '))
    }

    schema.complexExtensions.deserialize = deserializeComplexType

    schema.enumExtensions._deserialize = deserializeEnum
    schema.objectExtensions._deserialize = deserializeObject

    for (const name in standardDeserializers) {
        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._deserialize = standardDeserializers[name]
        }
    }

    for (const name in customDeserializers) {
        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._deserialize = customDeserializers[name].deserialize
        }
    }
}