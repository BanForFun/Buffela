import Type from "./Type";
import Primitive from "./Primitive";

export interface EnumEntry {
    index: number;
}

export type EnumValue = `${Uppercase<string>}${string}`

type EnumType<P extends Primitive = {}> = Type<P, 'enum'> & {
    [value: EnumValue]: EnumEntry
    values: string[]
}

export default EnumType;