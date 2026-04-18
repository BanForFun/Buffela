import {serializeValue} from "./typeUtils.js";

/**
 * @this {Serializer.ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const leafType = this.isLeaf ? this : object._type
    serializeValue(buffer, this.leafIndexType, leafType.leafIndex)

    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]
        serializeValue(buffer, field.type, object[name])
    }
}