/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedType} type
 * @return {any}
 */
export function deserializeSize(buffer, type) {
    const { element } = type
    if (typeof element === 'object') {
        return element._deserialize(buffer, type.argument)
    } else {
        return element
    }
}

/**
 *
 * @param {DeserializerBuffer} buffer
 * @param {Deserializer.InstantiatedFieldType} type
 * @param {number} dimension
 * @return {any}
 */
export function deserializeField(buffer, type, dimension = type.dimensions?.length) {
    const isArray = dimension > 0
    const optional = isArray ? type.dimensions[dimension - 1].optional : type.optional

    if (optional) {
        if (!buffer.readBoolean()) return null
    }

    if (isArray) {
        const length = deserializeSize(buffer, type.dimensions[dimension - 1])
        return Array.from({ length }, () => deserializeField(buffer, type, dimension - 1))
    } else {
        return type.element._deserialize(buffer, type.argument)
    }
}