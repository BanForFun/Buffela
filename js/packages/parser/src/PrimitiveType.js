const prototype = { kind: 'primitive' }

export default function PrimitiveType(name) {
    const primitive = Object.create(prototype)
    primitive.name = name

    return primitive
}