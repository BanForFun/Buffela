import type { Calf } from "@buffela/parser/types/Calf"

declare function deserializeCalf<D>(calf: Calf<D>, buffer: Buffer): D

export { deserializeCalf }