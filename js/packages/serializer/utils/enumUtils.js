import {serializePrimitiveSize} from "./typeUtils.js";

/**
 * @this {SerializerTypes.EnumType}
 * @param {SerializerBuffer} buffer
 * @param {SerializerTypes.EnumEntry} entry
 */
export function serializeEnum(buffer, entry) {
    if (this.entryIndexType) {
        serializePrimitiveSize(buffer, this.entryIndexType, entry.index)
    }
}