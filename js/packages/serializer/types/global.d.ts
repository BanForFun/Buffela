import type * as parser from "@buffela/parser";
import type * as serializer from "./index.d.ts";

declare namespace SerializerTypes {
    type EnumType = parser.EnumType<SerializerExtensions>
    type ObjectType = parser.ObjectType<SerializerExtensions>
    type Field = parser.Field<SerializerExtensions>
    type InstantiatedFieldType = parser.InstantiatedFieldType<SerializerExtensions>
    type InstantiatedPrimitiveSizeType = parser.InstantiatedPrimitiveSizeType<SerializerExtensions>
    type InstantiatedConstSizeType = parser.InstantiatedConstSizeType
    type InstantiatedSizeType = parser.InstantiatedSizeType<SerializerExtensions>
    type Schema = parser.Schema<SerializerExtensions, Serializable>
    type EnumEntry = parser.EnumEntry
}

declare global {
    type CustomSerializer = serializer.Serializer<unknown>
    type Serializable = serializer.Serializable<unknown>
    type SerializerBuffer = serializer.SerializerBuffer

    type SerializeCallback = (
        buffer: SerializerBuffer,
        value: any,
        arg: SerializerTypes.InstantiatedSizeType | null
    ) => void

    interface SerializerExtensions {
        _serialize: SerializeCallback
    }
}

