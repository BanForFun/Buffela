/**
 *
 * @param {NodeJS.WritableStream} stream
 * @constructor
 */
function Printer(stream) {
    let indent = 0;
    let isBlockEmpty = false;

    function print(string) {
        stream.write(string)
    }

    function printIndent() {
        print("".padEnd(indent * 4))
    }

    function printIndented(string) {
        printIndent()
        print(string)
    }

    /**
     *
     * @param {string} [string]
     */
    this.line = function(string = "") {
        if (isBlockEmpty) print('\n')

        printIndented(string)
        print('\n')

        isBlockEmpty = false
    }

    /**
     *
     * @param {string[]} lines
     * @param {string} [separator]
     */
    this.lines = function(lines, separator = "") {
        if (isBlockEmpty) print('\n')

        for (let i = 0; i < lines.length; i++) {
            printIndent()
            if (i > 0) print(separator)
            print(lines[i])
            print('\n')
        }

        isBlockEmpty = false
    }

    /**
     *
     * @param {string} [string]
     */
    this.blockStart = function(string) {
        print('\n')

        printIndented(string)

        indent++
        isBlockEmpty = true
    }

    /**
     *
     * @param {string} string
     */
    this.blockEnd = function(string) {
        indent--

        if (isBlockEmpty)
            print(string)
        else
            printIndented(string)

        print('\n')

        isBlockEmpty = false
    }

    /**
     *
     * @param {string} string
     */
    this.blockEndStart = function(string) {
        indent--

        if (isBlockEmpty)
            print(string)
        else
            printIndented(string)

        indent++
        isBlockEmpty = true
    }
}

module.exports = Printer;
