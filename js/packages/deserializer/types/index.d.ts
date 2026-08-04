import {Extensions, SimplifiedSchema, CustomPrimitiveConfiguration} from "@buffela/parser"
import {SerializerBuffer} from "@buffela/serializer";

declare class DeserializerBuffer {
    constructor(bytes: Uint8Array)

    readonly position: number

    alignToByte(): void

    readByte(): number
    readUByte(): number
    readShort(): number
    readUShort(): number
    readInt(bitLength?: number): number
    readUInt(bitLength?: number): number
    readLong(): bigint
    readULong(): bigint
    readFloat(): number
    readDouble(): number
    readBoolean(): boolean
    readString(length?: number): string
    readBytes(length: number): Uint8Array
}

export interface Deserializable<T> {
    deserialize: (bytes: DeserializerBuffer | Uint8Array) => T
}

export type DeserializerArgument = number | ((buffer: DeserializerBuffer) => unknown)

export interface Deserializer<T> extends CustomPrimitiveConfiguration {
    deserialize: (buffer: DeserializerBuffer, argument?: DeserializerArgument) => T
}

type PrimitiveDeserializers<S extends Record<string, Extensions>> = {
    [K in keyof S]-?: Required<S[K] & {}> extends Deserializer<infer T> ? Deserializer<T> : never
}

type DeserializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Deserializable<infer T> ? S[K] & Deserializable<T> : S[K]
}

declare function registerDeserializer<S extends SimplifiedSchema>(
    schema: S,
    customDeserializers: PrimitiveDeserializers<S['primitiveTypes']>
): asserts schema is DeserializableSchema<S>

export { registerDeserializer, DeserializerBuffer }