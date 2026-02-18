import type * as parser from "@buffela/parser";
import type * as serializer from "./index.d.ts";

declare global {
    type Serialize = (buffer: serializer.SerializerBuffer, value: unknown, arg: number | Serializer | null) => void

    interface Serializer extends serializer.Serializable<unknown> {
        _serialize: Serialize
    }

    type CustomSerializer = serializer.Serializer<unknown>
    type SerializerBuffer = serializer.SerializerBuffer

    type EnumType = parser.EnumType<Serializer>
    type ObjectType = parser.ObjectType<Serializer>
    type FieldType = parser.FieldType<Serializer>
    type Schema = parser.Schema<Serializer>
    type EnumEntry = parser.EnumEntry
}