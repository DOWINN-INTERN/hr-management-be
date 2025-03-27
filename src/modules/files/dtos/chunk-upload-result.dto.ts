interface ChunkUploadResult {
    uploadId: string;
    chunkNumber: number;
    receivedSize: number;
    totalChunksReceived: number;
    completed: boolean;
}