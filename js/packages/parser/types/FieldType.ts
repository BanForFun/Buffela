import Primitive from "./Primitive";

export type LengthArgument<P extends Primitive> = number | P

type FieldType<P extends Primitive = {}> = {
    final: boolean
    override: boolean
    name: string
    dimensions: LengthArgument<P>[]
    param: LengthArgument<P> | null
    primitive: P
}

export default FieldType;