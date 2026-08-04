import {nullaryDeserializers, variadicDeserializers, unaryDeserializers} from "./standardUtils.js";
import DeserializerBuffer from "../models/DeserializerBuffer.js";
import {deserializeEnum} from "./enumUtils.js";
import {deserializeObject} from "./objectUtils.js";
import {deserializerPrimitiveSize} from "./typeUtils.js";

const standardNames = new Set([
    ...Object.keys(nullaryDeserializers),
    ...Object.keys(variadicDeserializers),
    ...Object.keys(unaryDeserializers),
])

class InstantiatedPrimitiveSizeAdapter {
    /**
     * @type {DeserializerTypes.InstantiatedPrimitiveSizeType}
     */
    #argument;

    constructor(argument) {
        this.#argument = argument;
    }

    /**
     *
     * @param {DeserializerBuffer} buffer
     * @return {unknown}
     */
    deserialize(buffer) {
        return deserializerPrimitiveSize(buffer, this.#argument);
    }
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {DeserializerTypes.InstantiatedSizeType | null} arg
 * @return {unknown}
 */
function deserializeCustomPrimitive(buffer, arg) {
    if (arg == null) {
        return this._deserializer.deserialize(buffer)
    } else if (typeof arg.element === "object") {
        return this._deserializer.deserialize(buffer, new InstantiatedPrimitiveSizeAdapter(arg).deserialize)
    } else {
        return this._deserializer.deserialize(buffer, arg.element)
    }
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
        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            const deserializer = customDeserializers[name]

            if (deserializer.argument === 'none' && primitive.usedWithArgument)
                throw new Error(`Type '${name}' does not take arguments`)

            if (deserializer.argument === 'required' && primitive.usedWithoutArgument)
                throw new Error(`Type '${name}' needs an argument`)

            primitive._deserializer = deserializer
            primitive._deserialize = deserializeCustomPrimitive
        }
    }

    for (const name in nullaryDeserializers) {
        if (name in customDeserializers) continue

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            if (primitive.usedWithArgument)
                throw new Error(`Type '${name}' does not take arguments`)

            primitive._deserialize = nullaryDeserializers[name]
        }
    }

    for (const name in variadicDeserializers) {
        if (name in customDeserializers) continue

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            primitive._deserialize = variadicDeserializers[name]
        }
    }

    for (const name in unaryDeserializers) {
        if (name in customDeserializers) continue

        const primitive = schema.primitiveTypes[name]
        if (primitive) {
            if (primitive.usedWithoutArgument)
                throw new Error(`Type '${name}' needs an argument`)

            primitive._deserialize = unaryDeserializers[name]
        }
    }
}