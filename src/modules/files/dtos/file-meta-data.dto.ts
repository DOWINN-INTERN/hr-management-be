export class FileMetadata {
    key!: string;
    originalName!: string;
    size!: number;
    mimeType!: string;
    url?: string;
    createdAt!: Date;
    lastModified?: Date;
    eTag?: string;
    bucket?: string;
    location?: string;
    encoding?: string;
    metadata?: Record<string, any>;
}