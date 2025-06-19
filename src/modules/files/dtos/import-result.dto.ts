import { FileFormat } from "@/common/enums/file-format";

export class ImportResult {
  /**
   * Total number of records processed
   */
  totalRecords!: number;
  
  /**
   * Number of records successfully imported
   */
  successCount!: number;
  
  /**
   * Number of records that failed to import
   */
  errorCount!: number;
  
  /**
   * IDs of newly created records
   */
  created!: string[];
  
  /**
   * IDs of updated records
   */
  updated!: string[];
  
  /**
   * IDs of skipped records
   */
  skipped!: string[];
  
  /**
   * Processing time in milliseconds
   */
  importTime!: number;
  
  /**
   * Import metadata
   */
  metadata!: {
    format: FileFormat;
    startTime: string;
    endTime?: string;
    userId?: string;
    batchSize: number;
    dryRun?: boolean;
  };
  
  /**
   * Updated errors array with type and row information
   */
  errors!: Array<{
    record: any;
    error: string;
    type?: 'validation' | 'custom-validation' | 'database' | 'system' | 'transaction' | 'transformation';
    row?: number;
  }>;
}