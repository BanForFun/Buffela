import type {Primitive, SimplifiedSchema} from "@buffela/parser"

declare class DeserializerBuffer {
    constructor(buffer: Buffer)

    readonly offset: number

    readByte(offset?: number): number
    readUByte(offset?: number): number
    readShort(offset?: number): number
    readUShort(offset?: number): number
    readInt(offset?: number): number
    readUInt(offset?: number): number
    readLong(offset?: number): bigint
    readULong(offset?: number): bigint
    readFloat(offset?: number): number
    readDouble(offset?: number): number
    readString(offset?: number): string
    readStringNt(offset?: number): string
    readBuffer(offset?: number): Buffer
}

export type Deserializable<T> = {
    deserialize: (buffer: DeserializerBuffer | Buffer) => T
}

export type Deserializer<T> = {
    deserialize: (buffer: DeserializerBuffer) => T
}

type PrimitiveDeserializers<S extends Record<string, Primitive>> = {
    [K in keyof S]-?: Required<S[K]> extends Deserializer<infer T> ? Deserializer<T> : never
}

type DeserializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Deserializable<infer T> ? S[K] & Deserializable<T> : S[K]
}

declare function registerDeserializer<S extends SimplifiedSchema>(
    schema: S,
    deserializers: PrimitiveDeserializers<S['primitives']>
): asserts schema is DeserializableSchema<S>

export { registerDeserializer, DeserializerBuffer }