export interface Extensions {

}

export type TypeName = `${Uppercase<string>}${string}`

interface SchemaNode {
    name: string
    path: SchemaNode[]
}

interface SchemaNodeByName<N> {
    name: N
}

interface SchemaNodeByPath<P> {
    path: { [K in keyof P]: SchemaNodeByName<P[K]> }
}

type AbsoluteSchemaNode<P extends string[]> = SchemaNodeByPath<Omit<P, keyof any[]>>
export type RelativeSchemaNode<D extends number, N extends string> = SchemaNodeByPath<{ [K in D]: N }>

export interface AbsoluteEnumEntry<P extends string[]> extends AbsoluteSchemaNode<P> {

}

export interface AbsoluteSubtypeSchema<P extends string[]> extends AbsoluteSchemaNode<P> {
    instanceOf(value: unknown): value is { _type: AbsoluteSchemaNode<P>}
}

type Type<K extends string, E extends Extensions> = E & {
    name: string
    kind: K
}

export type InstantiatedType<E extends Extensions> = {
    optional: boolean // it is also used on const numeric optional array dimensions
    element: Type<string, E> | number
    argument: InstantiatedType<E> | null
    dimensions: InstantiatedType<E>[]
}

export type InstantiatedFieldType<E extends Extensions> = InstantiatedType<E> & {
    element: object
}

export interface Field<E extends Extensions> {
    override: boolean
    final: boolean
    type: InstantiatedFieldType<E>
}

export type ObjectType<E extends Extensions> = SchemaNode & Type<'object', E> & {
    [subtype: TypeName]: ObjectType<E>

    path: ObjectType<E>[]
    leafIndexType: InstantiatedType<E>
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

export type EnumType<E extends Extensions> = SchemaNode & Type<'enum', E> & {
    [value: EnumValue]: EnumEntry

    entryIndexType: InstantiatedType<E>
    entries: EnumEntry[]
}

export type RootType<E extends Extensions> = EnumType<E> | ObjectType<E>

export interface Schema<E extends Extensions, C extends Extensions> {
    [type: TypeName]: RootType<E>

    complexExtensions: E & C
    objectExtensions: E
    enumExtensions: E
    primitiveTypes: Record<string, Type<'primitive', E>>
}

export interface SimplifiedSchema {
    [type: TypeName]: Extensions

    primitiveTypes: Record<string, Extensions>
}

declare function parseSchema(definition: any): unknown

export { parseSchema }
