import {serializeValue} from "./typeUtils.js";

/**
 * @param {SerializerBuffer} buffer
 * @param {ObjectType} type
 * @param {object} object
 * @param {Record<string, Field>} fieldOverrides
 * @returns {number} leafIndex
 */
function getLeafIndex(buffer, type, object, fieldOverrides) {
    for (const fieldName in type.fieldOverrides) {
        fieldOverrides[fieldName] = type.fieldOverrides[fieldName]
    }

    if (type.isLeaf) return type.leafIndex

    const subtype = object[type.name + "_type"]
    return getLeafIndex(buffer, subtype, object, fieldOverrides)
}

/**
 * @param {SerializerBuffer} buffer
 * @param {ObjectType} type
 * @param {object} object
 * @param {Record<string, Field>} fieldOverrides
 */
function serializeFields(buffer, type, object, fieldOverrides) {
    for (const fieldName in type.ownFields) {
        const field = type.ownFields[fieldName]
        const finalField = field.final ? field : (fieldOverrides[fieldName] ?? field)

        serializeValue(buffer, finalField.type, object[fieldName])
    }

    if (type.isLeaf) return

    const subtype = object[type.name + "_type"]
    serializeFields(buffer, subtype, object, fieldOverrides)
}

/**
 * @this {ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const fieldOverrides = {}
    const leafIndex = getLeafIndex(buffer, this, object, fieldOverrides)

    if (this.defaultArgument) // Will be null if the type isn't abstract
        serializeValue(buffer, this.defaultArgument, leafIndex)

    serializeFields(buffer, this, object, fieldOverrides)
}