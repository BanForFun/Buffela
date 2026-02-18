export type Primitive = object

type FieldLengthArgument<P extends Primitive> = number | P

type FieldTypeArgument<P extends Primitive> = number | P | null

export interface FieldType<P extends Primitive = {}> {
    final: boolean
    override: boolean
    name: string
    dimensions: FieldLengthArgument<P>[]
    argument: FieldTypeArgument<P>
    primitive: P
}

export type TypeName = `${Uppercase<string>}${string}`

interface Type<K extends string> {
    kind: K;
}

type TypeArgument<P extends Primitive> = P | null

export interface ObjectType<P extends Primitive = {}> extends Type<'object'> {
    [subtype: TypeName]: ObjectType<P>

    metadataPrefix: string;
    argument: TypeArgument<P>;
    fields: Record<string, FieldType<P>>
    deferredFields: Record<string, FieldType<P>>
    parent: ObjectType<P> | null;

    leafIndex?: number;
    leafRangeEnd?: number;
    leaves?: ObjectType<P>[];

    isRoot: boolean;
    isInternal: boolean;
    isLeaf: boolean;
}

type EnumValue = Uppercase<string>

export interface EnumEntry {
    index: number;
}

export interface EnumType<P extends Primitive = {}> extends Type<'enum'> {
    [value: EnumValue]: EnumEntry

    argument: TypeArgument<P>;
    values: string[]
}

type SchemaType<P extends Primitive = {}> = EnumType<P> | ObjectType<P>

export interface Schema<P extends Primitive = {}> {
    [type: TypeName]: P & SchemaType<P>

    typePrototype: P
    objectPrototype: P
    enumPrototype: P
    primitives: Record<string, P>
}

export interface SimplifiedSchema {
    [type: TypeName]: Primitive
    primitives: Record<string, Primitive>
}

declare function parseSchema(definition: any): unknown;

export { parseSchema };
