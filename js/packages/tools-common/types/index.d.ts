declare function readSchemaFile(filePath: string): {
    schema: any;
    name: string;
};

declare function existsDirSync(path: string): boolean;

declare function resolveOutputFilePath(outputPath: string, defaultName: string): string;

declare class Printer {
    constructor(stream: WritableStream);

    line: (string?: string) => void;
    lines: (lines: string[], separator?: string) => void;
    blockStart: (string: string) => void;
    blockEnd: (string?: string) => void;
    blockEndStart: (string: string) => void;
}

declare const editorSchema: object;

export { Printer, readSchemaFile, existsDirSync, resolveOutputFilePath, editorSchema };
