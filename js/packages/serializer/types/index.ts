import type {Primitive, SimplifiedSchema} from "@buffela/parser"

declare class SerializerBuffer {
    constructor()

    readonly offset: number

    writeByte(byte: number, offset?: number): void
    writeUByte(uByte: number, offset?: number): void
    writeShort(short: number, offset?: number): void
    writeUShort(uShort: number, offset?: number): void
    writeInt(int: number, offset?: number): void
    writeUInt(uInt: number, offset?: number): void
    writeLong(long: bigint, offset?: number): void
    writeULong(uLong: bigint, offset?: number): void
    writeFloat(float: number, offset?: number): void
    writeDouble(double: number, offset?: number): void
    writeString(string: string, offset?: number): void
    writeStringNt(string: string, offset?: number): void
    writeBuffer(buffer: Buffer, offset?: number): void

    toBuffer(): Buffer
}

export type Serializable<T> = {
    serialize: (value: T, buffer?: SerializerBuffer) => SerializerBuffer
}

export type Serializer<T> = {
    serialize: (value: T, buffer: SerializerBuffer) => void
}

type PrimitiveSerializers<S extends Record<string, Primitive>> = {
    [K in keyof S]-?: Required<S[K]> extends Serializer<infer T> ? Serializer<T> : never
}

type SerializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Serializable<infer T> ? S[K] & Serializable<T> : S[K]
}

declare function registerSerializer<S extends SimplifiedSchema>(
    schema: S,
    serializers: PrimitiveSerializers<S['primitives']>
): asserts schema is SerializableSchema<S>

export { registerSerializer, SerializerBuffer }