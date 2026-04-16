/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType} type
 */
function skip(buffer, type) {
    if (!type.optional) return false
    return !buffer.readBoolean()
}


/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType} type
 * @param {number} dimension
 * @return {any}
 */
export function deserializeValue(buffer, type, dimension = type.dimensions?.length) {
    if (dimension > 0) {
        const sizeType = type.dimensions[dimension - 1]
        if (skip(buffer, sizeType)) return null

        const length = deserializeValue(buffer, sizeType)
        return Array.from({ length }, () => deserializeValue(buffer, type, dimension - 1))
    } else if (typeof type.element === 'object') {
        if (skip(buffer, type)) return null
        return type.element._deserialize(buffer, type.argument)
    } else if (typeof type.element === 'number') {
        return type.element
    }
}