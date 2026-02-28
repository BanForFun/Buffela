import type * as parser from "@buffela/parser";
import type * as serializer from "./index.d.ts";

declare namespace Serializer {
    type ComplexType = parser.ComplexType<string, Serializer>
    type EnumType = parser.EnumType<Serializer>
    type ObjectType = parser.ObjectType<Serializer>
    type Field = parser.Field<Serializer>
    type InstantiatedType = parser.InstantiatedType<Serializer>
    type Schema = parser.Schema<Serializer, Serializable>
    type EnumEntry = parser.EnumEntry
}

declare global {
    type CustomSerializer = serializer.Serializer<unknown>
    type Serializable = serializer.Serializable<unknown>
    type SerializerBuffer = serializer.SerializerBuffer

    type Serialize = (buffer: SerializerBuffer, value: any, arg: Serializer.InstantiatedType | null) => void

    interface Serializer {
        _serialize: Serialize
    }
}