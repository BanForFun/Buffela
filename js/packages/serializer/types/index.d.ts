import type Calf from "@buffela/parser/internal/Calf"

declare function serializeCalf<D>(calf: Calf<D>, data: D): Buffer

export { serializeCalf }