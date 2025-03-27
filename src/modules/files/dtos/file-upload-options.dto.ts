export class FileUploadOptions {
    folder?: string;
    customFileName?: string;
    metadata?: Record<string, any>;
    public?: boolean;
    contentType?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
}