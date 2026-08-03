/**
 *
 * @param {SerializerBuffer} buffer
 * @param {Serializer.InstantiatedType} type
 * @param {unknown} value
 */
export function serializeSize(buffer, type, value) {
    const { element } = type
    if (typeof element === 'object') {
        element._serialize(buffer, value, type.argument)
    } else if (value !== element) {
        throw new Error(`Expected size '${element}' (got '${value}')`)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {Serializer.InstantiatedFieldType} type
 * @param {unknown} value
 * @param {number} dimension
 */
export function serializeField(buffer, type, value, dimension = type.dimensions?.length) {
    const isArray = dimension > 0
    const optional = isArray ? type.dimensions[dimension - 1].optional : type.optional

    if (optional) {
        const present = value !== null
        buffer.writeBoolean(present)

        if (!present) return
    }

    if (isArray) {
        serializeSize(buffer, type.dimensions[dimension - 1], value.length)

        for (let i = 0; i < value.length; i++) {
            try {
                serializeField(buffer, type, value[i], dimension - 1)
            } catch(err) {
                throw new Error(`Unable to serialize element ${i}`, { cause: err })
            }
        }
    } else {
        type.element._serialize(buffer, value, type.argument)
    }
}