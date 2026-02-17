export type Primitive = object

type LengthArgument<P extends Primitive> = number | P

export type FieldType<P extends Primitive = {}> = {
    final: boolean
    override: boolean
    name: string
    dimensions: LengthArgument<P>[]
    param: LengthArgument<P> | null
    primitive: P
}

export type TypeName = `${Uppercase<string>}${string}`

type Type<P extends Primitive, K extends string> = P & {
    kind: K;
    param: P;
}

export type ObjectType<P extends Primitive = {}> = Type<P, 'object'> & {
    [subtype: TypeName]: ObjectType<P>

    fields: Record<string, FieldType<P>>
    parent: ObjectType<P> | null;

    leafIndex?: number;
    leaves?: ObjectType<P>[];

    isRoot: boolean;
    isLeaf: boolean;
    isAbstract: boolean;
}

type EnumValue = Uppercase<string>

type EnumEntry = {
    index: number;
}

export type EnumType<P extends Primitive = {}> = Type<P, 'enum'> & {
    [value: EnumValue]: EnumEntry
    values: string[]
}

export type Schema<P extends Primitive = {}> = {
    [type: TypeName]: EnumType<P> | ObjectType<P>

    objectPrototype: P
    enumPrototype: P
    primitives: Record<string, P>
}

export type SimplifiedSchema = {
    [type: TypeName]: Primitive
    primitives: Record<string, Primitive>
}

declare function parseSchema(definition: any): unknown;

export { parseSchema };
