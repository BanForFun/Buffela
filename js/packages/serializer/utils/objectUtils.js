import {serializeValue} from "./typeUtils.js";

/**
 * @param {SerializerBuffer} buffer
 * @param {Serializer.ObjectType[]} path
 * @param {object} object
 * @param {Record<string, Serializer.Field>} fieldOverrides
 * @returns {number} leafIndex
 */
function getLeafIndex(buffer, path, object, fieldOverrides) {
    let type = path[0]
    while (!type.isLeaf) {
        for (const name in type.fieldOverrides) {
            fieldOverrides[name] = type.fieldOverrides[name]
        }

        type = object[type.name + "_type"]
        path.push(type)
    }

    return type.leafIndex
}

/**
 * @param {SerializerBuffer} buffer
 * @param {Serializer.ObjectType} type
 * @param {object} object
 * @param {Record<string, Serializer.Field>} fieldOverrides
 */
function serializeFields(buffer, type, object, fieldOverrides) {
    for (const name in type.ownFields) {
        const field = type.ownFields[name]
        const finalField = field.final ? field : (fieldOverrides[name] ?? field)

        serializeValue(buffer, finalField.type, object[name])
    }
}

/**
 * @this {Serializer.ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const fieldOverrides = {}
    const leafPath = [this]
    const leafIndex = getLeafIndex(buffer, leafPath, object, fieldOverrides)

    if (this.defaultArgument) // Will be null if the type isn't abstract
        serializeValue(buffer, this.defaultArgument, leafIndex)

    for (const type of leafPath) {
        serializeFields(buffer, type, object, fieldOverrides)
    }
}