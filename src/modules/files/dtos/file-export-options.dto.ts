export class FileExportOptions {
    filename?: string;
    columns?: Array<{id: string, title: string}>;
    headerStyle?: any;
    bodyStyle?: any;
    sheetName?: string;
    orientation?: 'portrait' | 'landscape';
}