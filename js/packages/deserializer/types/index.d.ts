import {Primitive, SimplifiedSchema} from "@buffela/parser"

declare class DeserializerBuffer {
    constructor(buffer: Buffer)

    offset: number

    readByte(): number
    readUByte(): number
    readShort(): number
    readUShort(): number
    readInt(): number
    readUInt(): number
    readLong(): bigint
    readULong(): bigint
    readFloat(): number
    readDouble(): number
    readString(): string
    readStringNt(): string
    readBuffer(): Buffer
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