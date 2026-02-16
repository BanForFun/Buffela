/**
 * Repeats a string a number of times
 * @param {string} string
 * @param {number} times
 * @returns {string}
 */
function repeat(string, times) {
    return Array(times).fill(string).join("")
}

module.exports = { repeat }