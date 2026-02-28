import type * as parser from "@buffela/parser";
import type * as deserializer from "./index.d.ts";

declare namespace Deserializer {
    type ComplexType = parser.ComplexType<string, Deserializer>
    type EnumType = parser.EnumType<Deserializer>
    type ObjectType = parser.ObjectType<Deserializer>
    type Field = parser.Field<Deserializer>
    type InstantiatedType = parser.InstantiatedType<Deserializer>
    type Schema = parser.Schema<Deserializer, Deserializable>
    type EnumEntry = parser.EnumEntry
}

declare global {
    type CustomDeserializer = deserializer.Deserializer<unknown>
    type Deserializable = deserializer.Deserializable<unknown>
    type DeserializerBuffer = deserializer.DeserializerBuffer

    type Deserialize = (buffer: DeserializerBuffer, arg: Deserializer.InstantiatedType | null) => any

    interface Deserializer {
        _deserialize: Deserialize
    }
}