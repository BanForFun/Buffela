import { TypeName } from "./Type"
import EnumType from "./EnumType";
import ObjectType from "./ObjectType";
import Primitive from "./Primitive";

export default interface Schema<P extends Primitive = {}> {
    [type: TypeName]: EnumType<P> | ObjectType<P>

    objectPrototype: P
    enumPrototype: P
    primitives: Record<string, P>
}