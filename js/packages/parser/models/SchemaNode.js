import {inspectSymbol} from "../constants/symbols.js";

export default class SchemaNode {
    #inspectType = "BuffelaNode"
    #fullName

    constructor(parentPath, name) {
        Object.defineProperty(this, 'name', { value: name })
        Object.defineProperty(this, 'path', { value: [ ...parentPath, this ] })

        this.#fullName = this.path.map(n => n.name).join('.')
    }

    [inspectSymbol]() {
        return `<${this.#inspectType} ${this.#fullName}>`
    }

    instanceOf(value) {
        const leafPath = value?._type?.path
        if (!Array.isArray(leafPath)) return false

        for (let i = 0; i < this.path.length; i++) {
            if (leafPath[i] !== this.path[i]) return false
        }

        return true
    }
}