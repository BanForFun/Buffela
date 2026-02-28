import {standardDeserializers, standardNames} from "./standardUtils.js";
import {deserializeEnum} from "./enumUtils.js";
import DeserializerBuffer from "../models/DeserializerBuffer.js";
import {deserializeObject} from "./objectUtils.js";


/**
 *
 * @this {Deserializer.ComplexType}
 * @param {DeserializerBuffer | Buffer} bytes
 * @return {unknown}
 */
function deserializeComplexType(bytes) {
    if (bytes instanceof DeserializerBuffer) {
        return this._deserialize(bytes, null)
    } else if (Buffer.isBuffer(bytes)) {
        const buffer = new DeserializerBuffer(bytes)
        return this._deserialize(buffer, null)
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