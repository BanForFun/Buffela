import {deserializerPrimitiveSize} from "./typeUtils.js";

/**
 * @this {DeserializerTypes.EnumType}
 * @param {DeserializerBuffer} buffer
 * @returns {DeserializerTypes.EnumEntry | undefined}
 */
export function deserializeEnum(buffer) {
    return this.entryIndexType
        ? this.entries[deserializerPrimitiveSize(buffer, this.entryIndexType)]
        : undefined
}