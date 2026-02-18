/**
 * @this {EnumType}
 * @param {SerializerBuffer} buffer
 * @param {EnumEntry} entry
 */
export function serializeEnum(buffer, entry) {
    // Argument can be null if enum only has one value, skip
    this.argument?._serialize(buffer, entry.index, null)
}