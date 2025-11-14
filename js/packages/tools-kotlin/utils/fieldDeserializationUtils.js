const {typeMap} = require("@buffela/parser");

function printDeserializerImports() {
    printer.line(`
import kotlinx.io.readDoubleLe
import kotlinx.io.readFloatLe
import kotlinx.io.readUByte
import kotlinx.io.readUIntLe
import kotlinx.io.readULongLe
import kotlinx.io.readUShortLe
import kotlinx.io.readByteArray
import kotlinx.io.readString
import gr.elaevents.buffela.internal.utils.readStringNt`)
}

function readSimpleVariable(typeIndex) {
    switch (typeIndex) {
        case typeMap.Boolean.index:
            return `packet.readUByte() > 0u`
        case typeMap.Byte.index:
            return `packet.readByte()`
        case typeMap.Short.index:
            return `packet.readShortLe()`
        case typeMap.Int.index:
            return `packet.readIntLe()`
        case typeMap.Long.index:
            return `packet.readLongLe()`
        case typeMap.Float.index:
            return `packet.readFloatLe()`
        case typeMap.Double.index:
            return `packet.readDoubleLe()`
        case typeMap.UByte.index:
            return `packet.readUByte()`
        case typeMap.UShort.index:
            return `packet.readUShortLe()`
        case typeMap.UInt.index:
            return `packet.readUIntLe()`
        case typeMap.ULong.index:
            return `packet.readULongLe()`
        default:
            throw new Error(`Invalid type with index ${typeIndex}`)
    }
}

function readSizeField(field) {
    if (typeof field === "number") return field

    if (typeof field !== "object")
        throw new Error('Invalid size type')

    switch (field.base) {
        case typeMap.UByte.index:
            return `packet.readUByte().toInt()`
        case typeMap.UShort.index:
            return `packet.readUShortLe().toInt()`
        case typeMap.Int.index:
            return `packet.readIntLe()`
        default:
            throw new Error(`Invalid size type with index ${field.base}`)
    }
}

function readArray(field, typeIndex) {
    const size = readSizeField(field.size)
    return `${typeMap[field.base].kt}(${size}) { _ -> ${readSimpleVariable(typeIndex)} }`
}

function readVariable(field, dimension = field.dimensions?.length) {
    if (typeof field !== 'object')
        throw new Error('Expected a variable')

    if (dimension > 0) {
        const sizeField = field.dimensions[dimension - 1]
        const size = readSizeField(sizeField)

        return `Array(${size}) { _ -> ${readVariable(field,dimension - 1)} }`
    }

    if (typeof field.base === 'number') {
        // Built-in type
        switch(field.base) {
            case typeMap.String.index:
                if (typeof field.size === 'number')
                    return `packet.readString(${field.size})`
                else if (field.size === null)
                    return `packet.readStringNt()`
                else
                    throw new Error('Invalid string constant size')
            case typeMap.IntArray.index:
                return readArray(field, typeMap.Int.index)
            case typeMap.ShortArray.index:
                return readArray(field, typeMap.Short.index)
            case typeMap.ByteArray.index:
                return readArray(field, typeMap.Byte.index)
            case typeMap.LongArray.index:
                return readArray(field, typeMap.Long.index)
            case typeMap.FloatArray.index:
                return readArray(field, typeMap.Float.index)
            case typeMap.DoubleArray.index:
                return readArray(field, typeMap.Double.index)
            case typeMap.UByteArray.index:
                return readArray(field, typeMap.UByte.index)
            case typeMap.UShortArray.index:
                return readArray(field, typeMap.UShort.index)
            case typeMap.UIntArray.index:
                return readArray(field, typeMap.UInt.index)
            case typeMap.ULongArray.index:
                return readArray(field, typeMap.ULong.index)
            case typeMap.BooleanArray.index:
                return readArray(field, typeMap.Boolean.index)
            case typeMap.Buffer.index:
                const size = readSizeField(field.size)
                return `packet.readByteArray(${size})`
            default:
                if (field.size !== null)
                    throw new Error('Unexpected size on simple type')

                return readSimpleVariable(field.base)
        }
    } else if (typeof field.base === 'object') {
        const calf = field.base
        if (calf.type === "enum")
            return `${calf.name}.entries[packet.readUByte().toInt()]`
        else if (calf.type === "data")
            return `${calf.name}.deserialize(packet)`
        else
            throw new Error('Invalid field base calf format')
    } else {
        throw new Error('Invalid field base type format')
    }
}

module.exports = {printDeserializerImports, readVariable}