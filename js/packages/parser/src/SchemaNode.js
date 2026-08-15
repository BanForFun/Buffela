import {inspectSymbol} from "../constants/symbols.js";

export default class SchemaNode {
    #inspectType = "SchemaNode"

    constructor(parentPath, name) {
        Object.defineProperty(this, 'name', { value: name })
        Object.defineProperty(this, 'path', { value: [ ...parentPath, this ] })
        Object.defineProperty(this, 'fullName', { value: this.path.map(n => n.name).join('.') })
    }

    [inspectSymbol]() {
        return `<${this.#inspectType} ${this.fullName}>`
    }

    isChild(node) {
        const childPath = node?.path
        if (!Array.isArray(childPath)) return false

        for (let i = 0; i < this.path.length; i++) {
            if (childPath[i] !== this.path[i]) return false
        }

        return true
    }
}