declare function readSchemaFile(filePath: string): {
    schema: any;
    name: string;
};

declare function existsDirSync(path: string): boolean;

declare function getFileOutputStream(outputPath: string, defaultName: string): WritableStream;

declare class Printer {
    constructor(stream: WritableStream);

    line: (string?: string) => void;
    lines: (lines: string[], separator?: string) => void;
    blockStart: (string: string) => void;
    blockEnd: (string?: string) => void;
    blockEndStart: (string: string) => void;
}

declare const editorSchema: object;

export { Printer, readSchemaFile, existsDirSync, getFileOutputStream, editorSchema };
