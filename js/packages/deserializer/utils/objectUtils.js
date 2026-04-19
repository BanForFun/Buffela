import { deserializeField, deserializeSize } from "./typeUtils.js";

/**
 *
 * @this {Deserializer.ObjectType}
 * @param {DeserializerBuffer} buffer
 * @return {object}
 */
export function deserializeObject(buffer) {
    const leafIndex = deserializeSize(buffer, this.leafIndexType)
    const leafType = this.leaves[leafIndex]

    const result = this.isLeaf ? {} : { _type: leafType }
    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]
        result[name] = deserializeField(buffer, field.type)
    }

    return result
}