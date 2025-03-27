export class FileListOptions {
    prefix?: string;
    limit?: number;
    marker?: string;
    sortBy?: 'name' | 'date';
    sortDirection?: 'asc' | 'desc';
    includeUrls?: boolean;
}