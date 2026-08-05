import {
    Extensions,
    SimplifiedSchema,
    CustomPrimitiveConfig,
    CustomPrimitiveArgumentConfig,
    CustomPrimitiveArgumentType
} from "@buffela/parser"

declare class SerializerBuffer {
    constructor()

    readonly length: number

    alignToByte(): void

    writeByte(byte: number): void
    writeUByte(uByte: number): void
    writeShort(short: number): void
    writeUShort(uShort: number): void
    writeInt(int: number, bitLength?: number): void
    writeUInt(uInt: number, bitLength?: number): void
    writeLong(long: bigint): void
    writeULong(uLong: bigint): void
    writeFloat(float: number): void
    writeDouble(double: number): void
    writeBoolean(boolean: boolean): void
    writeString(string: string): void
    writeBytes(bytes: Uint8Array): void

    toBytes(): Uint8Array
}

export interface Serializable<T> {
    serialize(value: T, buffer: SerializerBuffer): void
    serialize(value: T): Uint8Array
}

export interface Serializer<T, A extends CustomPrimitiveArgumentConfig> extends CustomPrimitiveConfig<A> {
    serialize(buffer: SerializerBuffer, value: T, argument: CustomPrimitiveArgumentType<A>): void
}

type PrimitiveSerializers<S extends Record<string, Extensions>> = {
    [K in keyof S]-?: Required<S[K] & {}> extends Serializer<infer T, infer A> ? Serializer<T, A> : never
}

type SerializableSchema<S extends SimplifiedSchema> = {
    [K in keyof S]: Required<S[K]> extends Serializable<infer T> ? S[K] & Serializable<T> : S[K]
}

declare function registerSerializer<S extends SimplifiedSchema>(
    schema: S,
    customSerializers: PrimitiveSerializers<S['primitiveTypes']>
): asserts schema is SerializableSchema<S>

export { registerSerializer, SerializerBuffer }