import type * as parser from "@buffela/parser";
import type * as deserializer from "./index.d.ts";

declare namespace DeserializerTypes {
    type EnumType = parser.EnumType<DeserializerExtensions>
    type ObjectType = parser.ObjectType<DeserializerExtensions>
    type Field = parser.Field<DeserializerExtensions>
    type InstantiatedFieldType = parser.InstantiatedFieldType<DeserializerExtensions>
    type InstantiatedSizeType = parser.InstantiatedSizeType<DeserializerExtensions>
    type InstantiatedPrimitiveSizeType = parser.InstantiatedPrimitiveSizeType<DeserializerExtensions>
    type InstantiatedConstSizeType = parser.InstantiatedConstSizeType
    type Schema = parser.Schema<DeserializerExtensions, Deserializable>
    type EnumEntry = parser.EnumEntry
}

declare global {
    type CustomDeserializer = deserializer.Deserializer<unknown>
    type Deserializable = deserializer.Deserializable<unknown>
    type DeserializerBuffer = deserializer.DeserializerBuffer

    type DeserializeCallback = (
        buffer: DeserializerBuffer,
        arg: DeserializerTypes.InstantiatedSizeType | null
    ) => any

    interface DeserializerExtensions {
        _deserialize: DeserializeCallback
    }
}