import Schema from "./models/Schema.js";

export function parseSchema(definition) {
    return new Schema(definition)
}

