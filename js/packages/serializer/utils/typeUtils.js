/**
 *
 * @param {SerializerBuffer} buffer
 * @param {SerializerTypes.InstantiatedPrimitiveSizeType} type
 * @param {number} value
 */
export function serializePrimitiveSize(buffer, type, value) {
    type.element._serialize(buffer, value, type.argument)
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {SerializerTypes.InstantiatedSizeType} type
 * @param {number} value
 */
export function serializeSize(buffer, type, value) {
    const { element } = type
    if (typeof element === 'object') {
        serializePrimitiveSize(buffer, type, value)
    } else if (value !== element) {
        throw new Error(`Expected size '${element}' (got '${value}')`)
    }
}

/**
 *
 * @param {SerializerBuffer} buffer
 * @param {SerializerTypes.InstantiatedFieldType} type
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
        serializeSize(buffer, type.dimensions[dimension - 1].sizeType, value.length)

        for (let i = 0; i < value.length; i++) {
            try {
                serializeField(buffer, type, value[i], dimension - 1)
            } catch(err) {
                throw new Error(`Unable to serialize element at index ${i}`, { cause: err })
            }
        }
    } else {
        type.element._serialize(buffer, value, type.argument)
    }
}