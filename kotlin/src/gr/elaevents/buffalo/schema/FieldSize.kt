package gr.elaevents.buffalo.schema

import kotlin.reflect.KClass

@Target(AnnotationTarget.FIELD)
annotation class FieldSize(
    val type: KClass<*> = Nothing::class,
    val size: UInt = 0U
)