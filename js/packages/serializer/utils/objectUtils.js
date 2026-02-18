import {writeSize} from "./standardUtils.js";

/**
 *
 * @param {FieldType} field
 * @param {SerializerBuffer} buffer
 * @param value {unknown}
 * @param {number} dimension
 */
function serializeField(field, buffer, value, dimension = field.dimensions?.length) {
    if (dimension === 0) {
        field.primitive._serialize(buffer, value, field.argument)
    } else {
        const dimensionArgument = field.dimensions[dimension - 1]
        writeSize(buffer, value.length, dimensionArgument)

        for (const item of value)
            serializeField(field, buffer, item, dimension - 1)
    }
}

/**
 * @param {ObjectType} type
 * @param {SerializerBuffer} buffer
 * @param {object} object
 * @param {Record<string, FieldType>} fieldOverrides
 * @returns {number} leafIndex
 */
function serializeFields(type, buffer, object, fieldOverrides = {}) {
    for (const fieldName in type.fields) {
        const field = type.fields[fieldName]
        if (field.override) {
            fieldOverrides[fieldName] = field
        } else {
            serializeField(field, buffer, object[fieldName])
        }
    }

    if (type.isLeaf) return type.leafIndex

    const subtype = object[type.metadataPrefix + "type"]
    const leafIndex = serializeFields(subtype, buffer, object, fieldOverrides)

    for (const fieldName in type.deferredFields) {
        const field = fieldOverrides[fieldName] ?? type.deferredFields[fieldName]
        serializeField(field, buffer, object[fieldName])

        delete fieldOverrides[fieldName]
    }

    return leafIndex
}

/**
 * @this {ObjectType}
 * @param {SerializerBuffer} buffer
 * @param {object} object
 */
export function serializeObject(buffer, object) {
    const leafIndexOffset = buffer.offset
    this.argument?._serialize(buffer, 0, null) // Just reserve space, will get overwritten

    console.log(this.argument, object)

    const leafIndex = serializeFields(this, buffer, object)
    const savedOffset = buffer.offset

    buffer.offset = leafIndexOffset
    this.argument?._serialize(buffer, leafIndex, null)

    buffer.offset = savedOffset
}