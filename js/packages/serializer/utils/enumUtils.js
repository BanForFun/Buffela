import {serializeValue} from "./typeUtils.js";

/**
 * @this {Serializer.EnumType}
 * @param {SerializerBuffer} buffer
 * @param {Serializer.EnumEntry} entry
 */
export function serializeEnum(buffer, entry) {
    if (this.defaultArgument) // Argument can be null if enum only has one value, skip
        serializeValue(buffer, this.defaultArgument, entry.index)
}