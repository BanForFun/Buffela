declare function readSchemaFileSync(filePath: string): {
    schema: object;
    name: string;
} | null;

declare function existsDirSync(path: string): boolean;

type FileProcessor = (location: FileLocation) => void;

interface FileLocation {
    inputFile: string;
    outputRootDir: string;
    outputSubDir: string;
}

declare function processFiles(
    rootDirPaths: string[],
    matchExpression: string,
    watch: Boolean,
    callback: FileProcessor
): Promise<void>

declare function tryReadFileSync(filePath: string, encoding?: BufferEncoding): string | null;

declare class Printer {
    constructor(stream: WritableStream);

    line: (string?: string) => void;
    lines: (lines: string[], separator?: string) => void;
    blockStart: (string: string) => void;
    blockEnd: (string?: string) => void;
    blockEndStart: (string: string) => void;
}

declare const editorSchema: object;

export {
    Printer,
    readSchemaFileSync,
    existsDirSync,
    processFiles,
    tryReadFileSync,
    editorSchema
};
