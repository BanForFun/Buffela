declare function readSchemaFile(filePath: string): {
    schema: any;
    name: string;
};

declare function getFileOutputStream(outputPath: string, defaultName: string): NodeJS.WritableStream;

declare class Printer {
    constructor(stream: NodeJS.WritableStream);

    line: (string?: string) => void;
    lines: (lines: string[], separator?: string) => void;
    blockStart: (string: string) => void;
    blockEnd: (string: string) => void;
    blockEndStart: (string: string) => void;
}

export { Printer, readSchemaFile, getFileOutputStream };
