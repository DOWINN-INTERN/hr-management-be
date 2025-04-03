export class ChunkedFileInfo {
    filename!: string;
    fileSize!: number;
    mimeType!: string;
    totalChunks!: number;
    metadata!: Record<string, any>;
    folder!: string;
}