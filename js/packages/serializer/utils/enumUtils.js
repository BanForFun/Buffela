import {serializeValue} from "./typeUtils.js";

/**
 * @this {Serializer.EnumType}
 * @param {SerializerBuffer} buffer
 * @param {Serializer.EnumEntry} entry
 */
export function serializeEnum(buffer, entry) {
    serializeValue(buffer, this.entryIndexType, entry.index)
}