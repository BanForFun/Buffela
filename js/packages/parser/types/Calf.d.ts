declare const dataTypeSymbol: unique symbol;

export type Calf<D> = {
    [dataTypeSymbol]: D
};

export default Calf