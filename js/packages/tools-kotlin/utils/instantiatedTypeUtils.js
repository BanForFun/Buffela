/**
 * @param {import('@buffela/parser').InstantiatedSizeType} type
 */
function isConstantType(type) {
    return typeof type.element !== 'object'
}

module.exports = {
    isConstantType
}