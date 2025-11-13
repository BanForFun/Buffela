import type { Calf } from "@buffela/parser/types/Calf"

declare function serializeCalf<D>(calf: Calf<D>, data: D): Buffer

export { serializeCalf }