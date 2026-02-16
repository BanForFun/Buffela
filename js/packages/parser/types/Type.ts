import Primitive from "./Primitive";

export type TypeName = `${Uppercase<string>}${string}`

type Type<P extends Primitive, K extends string> = P & {
    kind: K;
    param: P;
}

export default Type