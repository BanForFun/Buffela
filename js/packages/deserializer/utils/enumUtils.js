import {deserializeSize} from "./typeUtils.js";

/**
 * @this {Deserializer.EnumType}
 * @param {DeserializerBuffer} buffer
 * @returns {Deserializer.EnumEntry} entry
 */
export function deserializeEnum(buffer) {
    const index = this.defaultArgument
        ? deserializeSize(buffer, this.defaultArgument)
        : 0

    return this.entries[index]
}