import {validateCustomPrimitiveConfiguration} from "@buffela/parser/internal";

import {standardDeserializers} from "./standardUtils.js";
import DeserializerBuffer from "../models/DeserializerBuffer.js";
import {deserializeEnum} from "./enumUtils.js";
import {deserializeObject} from "./objectUtils.js";

const standardNames = new Set(Object.keys(standardDeserializers))

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedConstSizeType | null} arg
 * @return {unknown}
 */
function deserializeCustomPrimitive(buffer, arg) {
    return this._doDeserialize(buffer, arg?.element)
}

/**
 *
 * @this {DeserializerExtensions}
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
 * @param {DeserializerTypes.Schema} schema
 * @param {Object.<string, CustomDeserializer>} customDeserializers
 */
export function registerDeserializer(schema, customDeserializers) {
    const customNames = new Set(Object.keys(customDeserializers))
    const missingNames = Array.from(
        new Set(Object.keys(schema.primitiveTypes))
            .difference(standardNames)
            .difference(customNames)
    )

    if (missingNames.length > 0) {
        throw new Error('Unknown type(s): ' + missingNames.join(', '))
    }

    schema.complexExtensions.deserialize = deserializeComplexType

    schema.enumExtensions._deserialize = deserializeEnum
    schema.objectExtensions._deserialize = deserializeObject

    for (const name in customDeserializers) {
        if (name in standardDeserializers)
            throw new Error(`Standard ${name} deserializer cannot be overridden`)

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            const deserializer = customDeserializers[name]
            validateCustomPrimitiveConfiguration(name, deserializer, primitive)

            primitive._doDeserialize = deserializer.deserialize
            primitive._deserialize = deserializeCustomPrimitive
        }
    }

    for (const name in standardDeserializers) {
        if (name in customDeserializers) continue

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._deserialize = standardDeserializers[name]
        }
    }
}