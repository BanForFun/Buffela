import {deserializeValue} from "./typeUtils.js";

/**
 * @this {Deserializer.EnumType}
 * @param {DeserializerBuffer} buffer
 * @returns {Serializer.EnumEntry}
 */
export function deserializeEnum(buffer) {
    return this.entries[deserializeValue(buffer, this.entryIndexType)]
}