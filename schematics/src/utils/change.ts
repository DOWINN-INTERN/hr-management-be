/**
 * Custom implementation of the InsertChange class for schematics
 */
export interface Change {
    apply(host: any): Promise<void> | void;
    readonly description: string;
    readonly order: number;
    readonly path: string;
  }
  
  export class InsertChange implements Change {
    order: number;
    description: string;
  
    constructor(public path: string, public pos: number, public toAdd: string) {
      this.description = `Inserted ${toAdd} into ${path} at ${pos}`;
      this.order = pos;
    }
  
    apply(host: any): Promise<void> | void {
      return host.insertLeft(this.pos, this.toAdd);
    }
  }