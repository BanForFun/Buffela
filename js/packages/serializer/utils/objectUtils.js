import {serializeField, serializeSize} from "./typeUtils.js";

/**
 * @this {Serializer.ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const leafType = this.isLeaf ? this : object._type
    serializeSize(buffer, this.leafIndexType, leafType.leafIndex)

    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]
        serializeField(buffer, field.type, object[name])
    }
}