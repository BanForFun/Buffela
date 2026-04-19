import {deserializeSize} from "./typeUtils.js";

/**
 * @this {Deserializer.EnumType}
 * @param {DeserializerBuffer} buffer
 * @returns {Deserializer.EnumEntry}
 */
export function deserializeEnum(buffer) {
    return this.entries[deserializeSize(buffer, this.entryIndexType)]
}