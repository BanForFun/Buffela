import {Extensions, SimplifiedSchema} from "@buffela/parser"

declare class DeserializerBuffer {
    constructor(buffer: Buffer)

    readonly position: number

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
    readNtString(): string
    readString(length: number): string
    readBuffer(length: number): Buffer
    readSigned(bitLength: number): number
    readUnsigned(bitLength: number): number
}

export type Deserializable<T> = {
    deserialize: (buffer: DeserializerBuffer | Buffer) => T
}

export type Deserializer<T> = {
    deserialize: (buffer: DeserializerBuffer) => T
}

type PrimitiveDeserializers<S extends Record<string, Extensions>> = {
    [K in keyof S]-?: Required<S[K]> extends Deserializer<infer T> ? Deserializer<T> : never
}

type DeserializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Deserializable<infer T> ? S[K] & Deserializable<T> : S[K]
}

declare function registerDeserializer<S extends SimplifiedSchema>(
    schema: S,
    customDeserializers: PrimitiveDeserializers<S['primitiveTypes']>
): asserts schema is DeserializableSchema<S>

export { registerDeserializer, DeserializerBuffer }