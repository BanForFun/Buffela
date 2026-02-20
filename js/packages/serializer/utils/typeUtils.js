/**
 *
 * @param {SerializerBuffer} buffer
 * @param {Serializer.InstantiatedType} type
 * @param {unknown} value
 * @param {number} dimension
 */
export function serializeValue(buffer, type, value, dimension = type.dimensions?.length) {
    if (dimension > 0) {
        const sizeType = type.dimensions[dimension - 1]
        serializeValue(buffer, sizeType, value.length)

        for (const item of value) {
            serializeValue(buffer, type, item, dimension - 1)
        }
    } else if (typeof type.element === 'object') {
        type.element._serialize(buffer, value, type.argument)
    } else if (typeof type.element === 'number' && value !== type.element) {
        throw new Error(`Expected size '${type.element}' (got '${value}')`)
    }
}