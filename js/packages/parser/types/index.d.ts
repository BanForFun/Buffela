export interface Extensions {

}

export type TypeName = `${Uppercase<string>}${string}`

type Type<E extends Extensions> = E & {
    name: string;
}

export type InstantiatedType<E extends Extensions> = {
    element: Type<E> | number
    argument: InstantiatedType<E> | null
    dimensions: InstantiatedType<E>[]
}

export interface Field<E extends Extensions> {
    final: boolean
    type: InstantiatedType<E>
}

export type ComplexType<K extends string, E extends Extensions> = Type<E> & {
    kind: K;
    defaultArgument: InstantiatedType<E> | null
}

export type ObjectType<E extends Extensions> = ComplexType<'object', E> & {
    [subtype: TypeName]: ObjectType<E>

    ownFields: Record<string, Field<E>>;
    fieldOverrides: Record<string, Field<E>>;
    parent: ObjectType<E> | null;

    isRoot: boolean;
    isInternal: boolean;
    isLeaf: boolean;

    leaves?: ObjectType<E>[];
    leafRangeEnd?: number;
    leafIndex?: number;
}

export type EnumValue = Uppercase<string>

export interface EnumEntry {
    index: number;
}

export type EnumType<E extends Extensions> = ComplexType<'enum', E> & {
    [value: EnumValue]: EnumEntry

    values: string[]
}

export type RootType<E extends Extensions> = EnumType<E> | ObjectType<E>

export interface Schema<E extends Extensions, C extends Extensions> {
    [type: TypeName]: RootType<E>

    complexExtensions: E & C
    objectExtensions: E
    enumExtensions: E
    primitiveTypes: Record<string, Type<E>>
}

export interface SimplifiedSchema {
    [type: TypeName]: Extensions
    primitiveTypes: Record<string, Extensions>
}

declare function parseSchema(definition: any): unknown;

export { parseSchema };
