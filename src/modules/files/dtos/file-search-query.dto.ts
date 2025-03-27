interface FileSearchQuery {
    name?: string;
    tags?: string[];
    contentType?: string | string[];
    sizeRange?: [number, number]; // min, max in bytes
    dateRange?: [Date, Date]; // from, to
    metadata?: Record<string, any>;
}