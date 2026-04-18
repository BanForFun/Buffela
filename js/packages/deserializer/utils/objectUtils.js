import {deserializeValue} from "./typeUtils.js";

/**
 *
 * @this {Deserializer.ObjectType}
 * @param {DeserializerBuffer} buffer
 * @return {object}
 */
export function deserializeObject(buffer) {
    const leafIndex = deserializeValue(buffer, this.leafIndexType)
    const leafType = this.leaves[leafIndex]

    const result = this.isLeaf ? {} : { _type: leafType }
    for (const name in leafType.allFields) {
        const field = leafType.allFields[name]
        result[name] = deserializeValue(buffer, field.type)
    }

    return result
}