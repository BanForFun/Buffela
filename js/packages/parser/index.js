const buffelaTypes = require('./constants/buffelaTypes')
const parseBuffelaSchema = require("./utils/buffelaParser")

module.exports = {
    typeMap: buffelaTypes.typeMap,
    parseBuffelaSchema
}