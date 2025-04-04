/**
 * Custom implementation of the InsertChange class for schematics
 */
export interface Change {
    apply(host: any): Promise<void> | void;
    readonly description: string;
    readonly order: number;
    readonly path: string;
}
export declare class InsertChange implements Change {
    path: string;
    pos: number;
    toAdd: string;
    order: number;
    description: string;
    constructor(path: string, pos: number, toAdd: string);
    apply(host: any): Promise<void> | void;
}
