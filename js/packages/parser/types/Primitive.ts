export default interface Primitive<T = unknown> {
    serialize?(value: T, buffer: unknown): void;
    deserialize?(buffer: unknown): T;
}