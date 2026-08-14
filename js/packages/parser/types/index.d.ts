export interface Extensions {

}

export type TypeName = `${Uppercase<string>}${string}`

interface SchemaNode {
    name: string
    fullName: string
    path: SchemaNode[]
}

interface SchemaNodeByName<N> {
    name: N
}

interface SchemaNodeByPath<P> {
    path: { [K in keyof P]: SchemaNodeByName<P[K]> }
}

type AbsoluteSchemaNode<P extends string[]> =
    SchemaNodeByPath<Omit<P, keyof any[]>>

export type RelativeSchemaNode<D extends number, N extends string> =
    SchemaNodeByPath<{ [K in D]: N }>

export interface AbsoluteEnumEntry<P extends string[]> extends AbsoluteSchemaNode<P> {

}

export interface AbsoluteSubtypeSchema<P extends string[]> extends AbsoluteSchemaNode<P> {
    instanceOf(value: unknown): value is { _type: AbsoluteSchemaNode<P>}
}

type DataType<K extends string, E extends Extensions> = E & {
    name: string,
    kind: K
}

export type InstantiatedConstSizeType = {
    element: number
}

export type InstantiatedPrimitiveSizeType<E extends Extensions> = {
    element: DataType<string, E>
    argument: InstantiatedConstSizeType | null
}

export type InstantiatedSizeType<E extends Extensions> =
    InstantiatedConstSizeType | InstantiatedPrimitiveSizeType<E>

export type InstantiatedFieldType<E extends Extensions> = {
    element: DataType<string, E>,
    argument: InstantiatedSizeType<E> | null,
    optional: boolean,
    dimensions: InstantiatedFieldTypeDimension<E>[]
}

export type InstantiatedFieldTypeDimension<E extends Extensions> = {
    sizeType: InstantiatedSizeType<E>,
    optional: boolean
}

export interface Field<E extends Extensions> {
    override: boolean
    final: boolean
    type: InstantiatedFieldType<E>
}

export type ObjectType<E extends Extensions> = SchemaNode & DataType<'object', E> & {
    [subtype: TypeName]: ObjectType<E>

    path: ObjectType<E>[]
    leafIndexType: InstantiatedPrimitiveSizeType<E> | null
    ownFields: Record<string, Field<E>>
    allFields?: Record<string, Field<E>>

    isRoot: boolean
    isInternal: boolean
    isLeaf: boolean

    leaves?: ObjectType<E>[]
    leafRangeEnd?: number
    leafIndex?: number
}

export type EnumValue = Uppercase<string>

export interface EnumEntry extends SchemaNode {
    index: number;
}

export type EnumType<E extends Extensions> = SchemaNode & DataType<'enum', E> & {
    [value: EnumValue]: EnumEntry

    entryIndexType: InstantiatedPrimitiveSizeType<E> | null
    entries: EnumEntry[]
}

export type PrimitiveType<E extends Extensions> = DataType<'primitive', E>

export interface PrimitiveDeclaration {
    parameterType: string,
    optional: boolean
}

export type RootType<E extends Extensions> = EnumType<E> | ObjectType<E>

export interface Schema<E extends Extensions, C extends Extensions> {
    [type: TypeName]: RootType<E>

    complexExtensions: E & C
    objectExtensions: E
    enumExtensions: E
    instantiatedAliases: Record<string, string>
    primitiveTypes: Record<string, PrimitiveType<E>>
    primitiveDeclarations: Record<string, PrimitiveDeclaration>
}

export interface SimplifiedSchema {
    [type: TypeName]: Extensions

    primitiveTypes: Record<string, Extensions>
}

declare function parseSchema(definition: any): unknown

export { parseSchema }
