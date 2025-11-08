import type Calf from "@buffela/parser/internal/Calf"

declare function deserializeCalf<D>(calf: Calf<D>, buffer: Buffer): D

export { deserializeCalf }