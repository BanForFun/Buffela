export = Printer;
/**
 *
 * @param {NodeJS.WritableStream} stream
 * @constructor
 */
declare function Printer(stream: NodeJS.WritableStream): void;
declare class Printer {
    /**
     *
     * @param {NodeJS.WritableStream} stream
     * @constructor
     */
    constructor(stream: NodeJS.WritableStream);
    /**
     *
     * @param {string} [string]
     */
    line: (string?: string) => void;
    /**
     *
     * @param {string[]} lines
     * @param {string} [separator]
     */
    lines: (lines: string[], separator?: string) => void;
    /**
     *
     * @param {string} string
     */
    blockStart: (string: string) => void;
    /**
     *
     * @param {string} string
     */
    blockEnd: (string: string) => void;
    /**
     *
     * @param {string} string
     */
    blockEndStart: (string: string) => void;
}
