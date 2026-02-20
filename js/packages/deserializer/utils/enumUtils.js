import {deserializeValue} from "./typeUtils.js";

/**
 * @this {Deserializer.EnumType}
 * @param {DeserializerBuffer} buffer
 * @returns {Serializer.EnumEntry} entry
 */
export function deserializeEnum(buffer) {
    const index = this.defaultArgument
        ? deserializeValue(buffer, this.defaultArgument)
        : 0

    return this.entries[index]
}