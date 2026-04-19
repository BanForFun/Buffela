/**
 * @param {import('@buffela/parser').InstantiatedType} type
 */
function isConstantType(type) {
    return typeof type.element !== 'object'
}

module.exports = {
    isConstantType
}