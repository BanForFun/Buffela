const { SmartBuffer } = require('smart-buffer')

const { schemaTypeIndices } = require('./buffaloTypes')

/**
 * @typedef {object} Field
 * @property {object|number|string} base
 * @property {Field[]} dimensions
 * @property {Field?} size
 */

/**
 * 
 * @param {Field} field 
 * @param {any} value 
 * @param {SmartBuffer} packet
 * @returns 
 */
function writePropertyIfNotConstant(field, value, packet) {
    if (typeof field.base !== 'string')
        writeProperty(field, value, packet)
}

/**
 * 
 * @param {Field} field 
 * @param {any} value 
 * @param {SmartBuffer} packet
 * @returns 
 */
function writeProperty(field, value, packet) {
    if (field.dimensions.length > 0) {
        const dimensionField = field.dimensions.pop()
        writePropertyIfNotConstant(dimensionField, value.length, packet);
        
        for (const item of value)
            writeProperty(field, item, packet)

        return
    }

    if (typeof field.base === 'number') {
        // Built-in type
        switch(field.base) {
        case schemaTypeIndices.Uuid:
            packet.writeBuffer(value)
            break;
        case schemaTypeIndices.String:
            packet.writeStringNT(value)
            break;
        case schemaTypeIndices.Boolean:
            packet.writeUInt8(value ? 1 : 0)
            break;
        case schemaTypeIndices.Byte:
            packet.writeInt8(value)
            break;
        case schemaTypeIndices.Short:
            packet.writeInt16LE(value)
            break;
        case schemaTypeIndices.Int:
            packet.writeInt32LE(value)
            break;
        case schemaTypeIndices.Long:
            packet.writeBigInt64LE(value)
            break;
        case schemaTypeIndices.Float:
            packet.writeFloatLE(value)
            break;
        case schemaTypeIndices.Double:
            packet.writeDoubleLE(value)
            break;
        case schemaTypeIndices.UByte:
            packet.writeUInt8(value)
            break;
        case schemaTypeIndices.UShort:
            packet.writeUInt16LE(value)
            break;
        case schemaTypeIndices.UInt:
            packet.writeUInt32LE(value)
            break;
        case schemaTypeIndices.ULong:
            packet.writeBigUInt64LE(value)
            break;
        case schemaTypeIndices.IntArray:
        case schemaTypeIndices.ShortArray:
        case schemaTypeIndices.ByteArray:
        case schemaTypeIndices.LongArray:
        case schemaTypeIndices.FloatArray:
        case schemaTypeIndices.DoubleArray:
        case schemaTypeIndices.UByteArray:
        case schemaTypeIndices.UShortArray:
        case schemaTypeIndices.UIntArray:
        case schemaTypeIndices.ULongArray:
        case schemaTypeIndices.BooleanArray:
            writePropertyIfNotConstant(field.size, value.length, packet)
            packet.writeBuffer(Buffer.from(value))
            break;
        case schemaTypeIndices.Buffer:
            writePropertyIfNotConstant(field.size, value.size, packet)
            packet.writeBuffer(value)
            break;
        default:
            throw new Error(`Unknown built-in type with index ${field.type}`)  //TODO: Better tracability
        }
    } else if (typeof field.base === 'object') {
        // Referenced type
        writeProperties(field.base, value, packet)
    } else {
        // Constant type
        throw new Error('Constant types not allowed inside packets')  //TODO: Better tracability
    }
}

/**
 * @template T
 * @param {T} calf 
 * @param {T["_objectType"]} object 
 * @param {SmartBuffer} packet
 * @returns {void}
 */
function writeProperties(calf, object, packet) {
    if (calf.type === "enum") {
        packet.writeUInt8(object.index)
        return
    }

    const typeKey = calf.typeKey
    if (typeKey != null) {
        const type = object[typeKey]
        packet.writeUInt8(type.index)
        writeProperties(type, object, packet)
    }

    for (const fieldName in calf.fields) {
        const field = calf.fields[fieldName]
        writeProperty(field, object[fieldName], packet)
    }
}

/**
 * @template T
 * @param {T} calf 
 * @param {T["_objectType"]} object 
 * @param {SmartBuffer} buffer
 * @returns {Buffer}
 */
function serializeBuffalo(calf, object) {
    const packet = new SmartBuffer()
    writeProperties(calf, object, packet)
    return packet.toBuffer()
}

module.exports = serializeBuffalo