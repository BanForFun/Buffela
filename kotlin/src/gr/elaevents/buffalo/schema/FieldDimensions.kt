package gr.elaevents.buffalo.schema

@Target(AnnotationTarget.FIELD)
annotation class FieldDimensions(vararg val dimensions: FieldSize)
