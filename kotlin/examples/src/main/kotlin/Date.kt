package gr.elaevents.buffela.examples

import gr.elaevents.buffela.deserialization.DeserializerBuffer
import gr.elaevents.buffela.serialization.SerializerBuffer

data class Date(val year: Int, val month: Int, val day: Int)

fun SerializerBuffer.writeDate(date: Date) {
    val yearMonth = (date.year - 1) * 12 + (date.month - 1)
    val day = date.day - 1

    writeUnsigned(yearMonth.toUInt(), 17)
    writeUnsigned(day.toUInt(), 5)
}

fun DeserializerBuffer.readDate(): Date {
    val yearMonth = readUnsigned(17).toInt()
    val day = readUnsigned(5).toInt()

    return Date(
        year = yearMonth / 12 + 1,
        month = yearMonth % 12 + 1,
        day = day + 1
    )
}