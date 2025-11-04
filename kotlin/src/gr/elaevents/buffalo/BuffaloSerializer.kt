package gr.elaevents.buffalo

import gr.elaevents.buffalo.schema.BuffaloType
import kotlinx.io.Buffer

fun <T : BuffaloType> serializeBuffalo(data: T): Buffer {
    val packet = Buffer()
    data.serializeHeader(packet)
    data.serializeBody(packet)
    return packet
}
