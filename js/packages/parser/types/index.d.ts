export interface Extensions {

}

type Type<E extends Extensions> = E & {
    name: string;
}

export type TypeArgument<E extends Extensions> = null | number | InstantiatedType<E>

export type InstantiatedType<E extends Extensions> = {
    element: Type<E>
    argument: TypeArgument<E>
    dimensions: FieldDimension<E>[]
}

export type FieldDimension<E extends Extensions> = number | InstantiatedType<E>

export interface Field<E extends Extensions> {
    final: boolean
    type: InstantiatedType<E>
}

export type ObjectSubtypeName = `${Uppercase<string>}${string}`
export type ComplexTypeArgument<E extends Extensions> = null | InstantiatedType<E>

export type ComplexType<K extends string, E extends Extensions> = Type<E> & {
    kind: K;
    defaultArgument: ComplexTypeArgument<E>;
}

export type ObjectType<E extends Extensions> = ComplexType<'object', E> & {
    [subtype: ObjectSubtypeName]: ObjectType<E>

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

export type SchemaTypeName = `${Uppercase<string>}${string}`
export type SchemaType<E extends Extensions> = EnumType<E> | ObjectType<E>

export interface Schema<E extends Extensions, U extends Extensions> {
    [type: SchemaTypeName]: SchemaType<E>

    userExtensions: E & U
    objectExtensions: E
    enumExtensions: E
    primitiveTypes: Record<string, Type<E>>
}

export interface SimplifiedSchema {
    [type: SchemaTypeName]: Extensions
    primitiveTypes: Record<string, Type<Extensions>>
}

declare function parseSchema(definition: any): unknown;

export { parseSchema };
