import Type, {TypeName} from "./Type";
import FieldType from "./FieldType";
import Primitive from "./Primitive";

type ObjectType<P extends Primitive = {}> = Type<P, 'object'> & {
    [subtype: TypeName]: ObjectType<P>

    fields: Record<string, FieldType<P>>
    parent: ObjectType<P> | null;

    leafIndex?: number;
    leaves?: ObjectType<P>[];

    isRoot: boolean;
    isLeaf: boolean;
    isAbstract: boolean;
}

export default ObjectType;