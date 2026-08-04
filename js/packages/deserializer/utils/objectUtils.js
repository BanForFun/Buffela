import { deserializeField, deserializeSize } from "./typeUtils.js";

/**
 *
 * @this {DeserializerTypes.ObjectType}
 * @param {DeserializerBuffer} buffer
 * @return {object}
 */
export function deserializeObject(buffer) {
    const leafIndex = this.leafIndexType ? deserializeSize(buffer, this.leafIndexType) : 0
    const leafType = this.leaves[leafIndex]

    const result = this.isLeaf ? {} : { _type: leafType }
    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]
        result[name] = deserializeField(buffer, field.type)
    }

    return result
}