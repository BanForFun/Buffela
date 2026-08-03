declare function readSchemaFile(filePath: string): {
    schema: object;
    name: string;
} | null;

declare function existsDirSync(path: string): boolean;

type FileProcessor = (filePath: string, workingDirectory: string) => void;

declare function processFiles(matchExpression: string, watch: Boolean, callback: FileProcessor): Promise<void>

declare function getNestedDirPath(filePath: string, relativeTo?: string): string;

declare class Printer {
    constructor(stream: WritableStream);

    line: (string?: string) => void;
    lines: (lines: string[], separator?: string) => void;
    blockStart: (string: string) => void;
    blockEnd: (string?: string) => void;
    blockEndStart: (string: string) => void;
}

declare const editorSchema: object;

export { Printer, readSchemaFile, existsDirSync, processFiles, getNestedDirPath, editorSchema };
