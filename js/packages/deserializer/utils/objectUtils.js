import {deserializeValue} from "./typeUtils.js";

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.ObjectType} type
 * @param {object} object
 * @param {Record<string, Deserializer.Field>} fieldOverrides
 * @returns {Deserializer.ObjectType[]}
 */
function getReversePath(buffer, type, object, fieldOverrides) {
    const path = [type]
    while (type.parent) {
        object[type.parent.name + "_type"] = type

        for (const name in type.fieldOverrides) {
            const field = type.fieldOverrides[name]
            if (field.final)
                fieldOverrides[name] = field
        }

        path.push(type.parent)
        type = type.parent
    }

    return path
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.ObjectType} type
 * @param {object} object
 * @param {Record<string, Deserializer.Field>} fieldOverrides
 */
function deserializeFields(buffer, type, object, fieldOverrides) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        const finalField = field.final ? field : (fieldOverrides[name] ?? field)

        object[name] = deserializeValue(buffer, finalField.type)
    }
}

/**
 *
 * @this {Deserializer.ObjectType}
 * @param {DeserializerBuffer} buffer
 * @return {object}
 */
export function deserializeObject(buffer) {
    const result = {}

    const leafIndex = this.defaultArgument
        ? deserializeValue(buffer, this.defaultArgument)
        : 0

    const leafType = this.leaves[leafIndex]
    const fieldOverrides = {}
    const reverseLeafPath = getReversePath(buffer, leafType, result, fieldOverrides)

    for (let i = reverseLeafPath.length - 1; i >= 0; i--) {
        deserializeFields(buffer, reverseLeafPath[i], result, fieldOverrides)
    }

    return result
}