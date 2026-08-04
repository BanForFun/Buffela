import { serializeField, serializePrimitiveSize } from "./typeUtils.js";

/**
 * @this {SerializerTypes.ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const leafType = this.isLeaf ? this : object._type
    if (this.leafIndexType) {
        serializePrimitiveSize(buffer, this.leafIndexType, leafType.leafIndex)
    }

    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]

        try {
            serializeField(buffer, field.type, object[name])
        } catch(err) {
            throw new Error(`Unable to serialize field '${name}' at ${this.fullName}`, { cause: err })
        }
    }
}