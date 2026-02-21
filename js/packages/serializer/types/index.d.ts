import {Extensions, SimplifiedSchema} from "@buffela/parser"

declare class SerializerBuffer {
    constructor()

    readonly length: number

    writeByte(byte: number): void
    writeUByte(uByte: number): void
    writeShort(short: number): void
    writeUShort(uShort: number): void
    writeInt(int: number): void
    writeUInt(uInt: number): void
    writeLong(long: bigint): void
    writeULong(uLong: bigint): void
    writeFloat(float: number): void
    writeDouble(double: number): void
    writeString(string: string): void
    writeNtString(string: string): void
    writeBuffer(buffer: Buffer): void
    writeSigned(value: number, bitLength: number): void
    writeUnsigned(value: number, bitLength: number): void

    toBuffer(): Buffer
}

export interface Serializable<T> {
    serialize(value: T, buffer: SerializerBuffer): void
    serialize(value: T): Buffer
}

export interface Serializer<T> {
    serialize(buffer: SerializerBuffer, value: T): void
}

type PrimitiveSerializers<S extends Record<string, Extensions>> = {
    [K in keyof S]-?: Required<S[K]> extends Serializer<infer T> ? Serializer<T> : never
}

type SerializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Serializable<infer T> ? S[K] & Serializable<T> : S[K]
}

declare function registerSerializer<S extends SimplifiedSchema>(
    schema: S,
    customSerializers: PrimitiveSerializers<S['primitiveTypes']>
): asserts schema is SerializableSchema<S>

export { registerSerializer, SerializerBuffer }