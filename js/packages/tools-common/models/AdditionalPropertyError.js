import ValidationError from "./ValidationError";

class AdditionalPropertyError extends ValidationError {
    getNode() {
        const objectNode = super.getNode()
        const pair = objectNode.items.find(p => p.key.source === this.params.additionalProperty)

        return pair.key
    }
}

module.exports = AdditionalPropertyError