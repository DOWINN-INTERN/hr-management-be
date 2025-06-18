import { PaginationDto } from '@/common/dtos/pagination.dto';
import { FileFormat } from '@/common/enums/file-format';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { BaseService } from '@/common/services/base.service';
import { BaseEntity } from '@/database/entities/base.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Buffer } from 'buffer';
import { ValidationError } from 'class-validator';
import * as Papa from 'papaparse';
import { DataSource, DeepPartial, EntityManager, EntityTarget } from 'typeorm';
import * as XLSX from 'xlsx';
import * as xml2js from 'xml2js';
import { DocumentMetadata, ExportOptionsDto } from '../dtos/export-options.dto';
import { ImportOptionsDto } from '../dtos/import-options.dto';
import { ImportResult } from '../dtos/import-result.dto';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Set up PDF fonts
(pdfMake as any).vfs = pdfFonts.vfs;

interface ExportResult<T> {
  data: Buffer | string;
  totalRecords: number;
  queryTime?: number;
  stats?: Record<string, any>;
}

@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}
  
  /**
   * Export data from a repository to the specified format
   */
  async exportData<T extends BaseEntity<T>>(
    service: BaseService<T>,
    options: ExportOptionsDto<T>,
  ): Promise<ExportResult<T>> {
    const startTime = Date.now();
    try {
      this.logger.log(`Beginning export operation with format: ${options.format}`);
      
      // Convert relations to string[] if needed
      let relations: string[] | undefined;
      if (Array.isArray(options.relations)) {
        relations = options.relations;
      } else if (options.relations && typeof options.relations === 'object') {
        relations = Object.keys(options.relations).filter(
          key => (options.relations as Record<string, boolean>)[key]
        );
      }

      // Create PaginationDto instance
      const paginationDto = new PaginationDto<T>();
      paginationDto.take = options.maxRecords || 1000;
      paginationDto.skip = 0;
      paginationDto.filter = options.filter || {};
      paginationDto.relations = relations;
      paginationDto.select = options.select;
      paginationDto.sort = options.sort || { createdAt: 'DESC' };

      this.logger.debug(`Fetching data with filter: ${JSON.stringify(options.filter)}`);
      
      const { data, totalCount } = await service.findAllComplex(
        options.scope || RoleScopeType.OWNED,
        paginationDto
      );

      const queryTime = Date.now() - startTime;
      this.logger.log(`Fetched ${data.length}/${totalCount} records in ${queryTime}ms`);

      if (!data || data.length === 0) {
        throw new BadRequestException('No data found to export');
      }

      // Transform data if a transformer is provided
      const transformedData = data;
      
      // Apply field mapping if specified
      const mappedData = options.fieldMap 
        ? this.mapFields(transformedData, options.fieldMap) 
        : transformedData;
      
      // Format and return based on requested format
      const formatResult = await this.formatOutput(
        mappedData, 
        options.format || FileFormat.CSV, 
        options.customHeaders,
        options.metadata,
        options.filter
      );
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      this.logger.log(`Export completed in ${totalTime}ms`);
      
      // Return result with metadata
      return {
        data: formatResult,
        totalRecords: totalCount,
        queryTime,
        stats: {
          exportedRecords: data.length,
          totalRecords: totalCount,
          processingTimeMs: totalTime,
          format: options.format,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      const errorTime = Date.now() - startTime;
      this.logger.error(`Error exporting data (${errorTime}ms): ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Format output data based on requested format
   */
  private async formatOutput(
    data: any[], 
    format: FileFormat, 
    customHeaders?: Record<string, string>,
    metadata?: DocumentMetadata,
    filter?: Record<string, any>
  ): Promise<Buffer | string> {
    try {
      switch (format) {
        case FileFormat.CSV:
          return this.formatCSV(data, customHeaders, filter, metadata);
          
        case FileFormat.EXCEL:
          return this.formatExcel(data, customHeaders, filter, metadata);
          
        case FileFormat.JSON:
          return this.formatJSON(data, customHeaders, filter, metadata);
          
        case FileFormat.XML:
          return this.formatXML(data, customHeaders, filter, metadata);
          
        case FileFormat.PDF:
          return await this.formatPDF(data, customHeaders, filter, metadata);
          
        default:
          throw new BadRequestException(`Unsupported export format: ${format}`);
      }
    } catch (error: any) {
      this.logger.error(`Error formatting output: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to format output: ${error.message}`);
    }
  }
  
  /**
   * Format data as CSV
   */
  private formatCSV(
    data: any[], 
    customHeaders?: Record<string, string>,
    filters?: Record<string, any>,
    metadata?: DocumentMetadata
  ): string {
    // Log the first item for debugging
    this.logger.debug(`CSV export data first item: ${JSON.stringify(data[0])}`);
    
    // We'll create two parts: metadata header rows and the actual data
    let csvLines: string[] = [];
    
    // 1. Add metadata section as header rows if requested
    if (metadata) {
      if (metadata.title) {
        csvLines.push(`# ${metadata.title}`);
      }
      if (metadata.subtitle) {
        csvLines.push(`# ${metadata.subtitle}`);
      }
      if (metadata.company) {
        csvLines.push(`# Company: ${metadata.company}`);
      }
      if (metadata.author) {
        csvLines.push(`# Author: ${metadata.author}`);
      }
      csvLines.push(`# Export date: ${new Date().toLocaleString()}`);
      if (metadata.description) {
        csvLines.push(`# ${metadata.description}`);
      }
      csvLines.push(''); // Empty line after metadata
    }

    // 2. Add filter section if available
    if (filters && Object.keys(filters).length > 0) {
      csvLines.push('# Filters:');
      try {
        // Add each filter as a comment line
        Object.entries(filters).forEach(([key, value]) => {
          const filterValue = typeof value === 'object' ? 
            JSON.stringify(value) : String(value);
          csvLines.push(`# ${key}: ${filterValue}`);
        });
      } catch (e) {
        // If processing fails, just add a note
        csvLines.push('# Filter processing error');
      }
      csvLines.push(''); // Empty line after filters
    }
    
    // Apply custom headers if provided
    let exportData = [...data];
    
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      csvLines.push('# Additional Information:');
      Object.entries(customHeaders).forEach(([key, value]) => {
        csvLines.push(`# ${key}: ${value}`);
      });
      csvLines.push(''); // Empty line after custom headers
    }
    
    // Generate CSV for the data part
    const dataCSV = Papa.unparse(exportData, {
      header: true,
      delimiter: ',',
      newline: '\r\n'
    });
    
    // Combine metadata lines with the data CSV
    const fullCSV = csvLines.length > 0 ? 
      `${csvLines.join('\r\n')}\r\n${dataCSV}` : 
      dataCSV;
    
    this.logger.debug(`CSV output sample (first 100 chars): ${fullCSV.substring(0, 100)}...`);
    
    return fullCSV;
  }
  
  /**
  * Format data as Excel
  */
  private formatExcel(
    data: any[], 
    customHeaders?: Record<string, string>,
    filters?: Record<string, any>,
    metadata?: DocumentMetadata
  ): Buffer {
    // Debug what data we received
    this.logger.debug(`Excel export: Received ${data.length} records`);
    this.logger.debug(`First record fields: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'none'}`);
    
    // Get field mapping from the applied field maps in previous steps
    // We're using data as-is since fieldMap was already applied in exportData method
    let exportData = [...data];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add metadata if provided
    if (metadata) {
      workbook.Props = {
        Title: metadata.title || '',
        Subject: metadata.subtitle || '',
        Author: metadata.author || '',
        Company: metadata.company || '',
        Comments: metadata.description || '',
        CreatedDate: new Date()
      };
    }
    
    // Add totals row if provided
    // if (totals) {
    //   const totalsRow: Record<string, any> = {};
      
    //   // Use keys directly since field mapping was already applied in exportData
    //   Object.keys(totals).forEach(key => {
    //     totalsRow[key] = totals[key];
    //   });
      
    //   // Add a label for the totals row
    //   const firstKey = Object.keys(totalsRow)[0] || Object.keys(exportData[0] || {})[0];
    //   if (firstKey) {
    //     totalsRow[firstKey] = 'TOTAL';
    //   }
      
    //   exportData.push(totalsRow);
    // }
    
    // Handle empty dataset
    if (!exportData.length || Object.keys(exportData[0] || {}).length === 0) {
      this.logger.warn('No data or empty records for Excel export');
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['No data available'],
        ['Your query returned no results or selected fields did not match any data']
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'No Data');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    
    // Create metadata worksheet - collect all header and info content first
    const headerContent: string[][] = [];
    
    // 1. Add metadata section
    if (metadata) {
      // Title
      if (metadata.title) {
        headerContent.push([metadata.title]);
      }
      
      // Subtitle
      if (metadata.subtitle) {
        headerContent.push([metadata.subtitle]);
      }
      
      // Company name, author, date
      if (metadata.company) {
        headerContent.push([`Company: ${metadata.company}`]);
      }
      
      if (metadata.author) {
        headerContent.push([`Prepared by: ${metadata.author}`]);
      }
      
      headerContent.push([`Export date: ${new Date().toLocaleString()}`]);
      
      // Description
      if (metadata.description) {
        headerContent.push([metadata.description]);
      }
      
      // Add spacing after metadata
      headerContent.push(['']);
    }
    
    // 2. Add filter section if available
    if (filters && Object.keys(filters).length > 0) {
      headerContent.push(['Filters:']);
      
      try {
        // Add each filter as a row
        Object.entries(filters).forEach(([key, value]) => {
          const filterValue = typeof value === 'object' ? 
            JSON.stringify(value) : String(value);
          headerContent.push([`${key}: ${filterValue}`]);
        });
      } catch (e) {
        // If processing fails, just add a note
        headerContent.push(['Filter processing error']);
      }
      
      // Add spacing after filters
      headerContent.push(['']);
    }
    
    // 3. Add custom headers as additional metadata above the data table
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      headerContent.push(['Additional Information:']);
      
      Object.entries(customHeaders).forEach(([key, value]) => {
        headerContent.push([`${key}: ${value}`]);
      });
      
      // Add spacing after custom headers
      headerContent.push(['']);
    }
    
    // Create the main worksheet with the metadata headers first
    const worksheet = XLSX.utils.aoa_to_sheet(headerContent);
    
    // 4. Now add the actual data table with column headers
    // Calculate the starting cell for data table (after all header content)
    const startRow = headerContent.length;
    
    // Add the data table to the worksheet using sheet_add_json
    XLSX.utils.sheet_add_json(worksheet, exportData, { 
      origin: startRow, 
      skipHeader: false,
      header: Object.keys(exportData[0] || {})
    });
    
    // Set column widths (auto-size based on content)
    const columnWidths = [];
    const maxCols = Math.max(...exportData.map(row => Object.keys(row).length), 1);
    
    for (let i = 0; i < maxCols; i++) {
      // Default width with some padding
      columnWidths.push({ wch: 15 });
    }
    
    worksheet['!cols'] = columnWidths;
    
    // Apply styles - make the title bold if possible
    if (worksheet['A1']) {
      worksheet['A1'].s = { font: { bold: true, sz: 14 } };
    }
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, metadata?.title?.substring(0, 31) || 'Data');
    
    // Generate buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Format data as JSON
   */
  private formatJSON(
    data: any[],
    customHeaders?: Record<string, string>,
    filters?: Record<string, any>,
    metadata?: DocumentMetadata
  ): string {
    // Create the result structure with metadata
    const result: any = {
      metadata: {
        ...metadata,
        totalData: data.length,
        exportDate: new Date().toLocaleString()
      },
      filters,
      customHeaders,
      data: [...data]
    };

    // Return prettified JSON
    return JSON.stringify(result, null, 2);
  }
  
  /**
   * Format data as XML
   */
  private formatXML(
    data: any[], 
    customHeaders?: Record<string, string>,
    filters?: Record<string, any>,
    metadata?: DocumentMetadata
  ): string {
    const builder = new xml2js.Builder({
      rootName: 'export',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    // Prepare data with proper XML field names (remove special chars)
    const cleanData = data.map(item => {
      const result: Record<string, any> = {};
      
      Object.keys(item).forEach(key => {
        const safeName = key.replace(/[^a-zA-Z0-9_]/g, '_');
        result[safeName] = item[key];
      });
      
      return result;
    });
    
    // Build the XML structure
    const xmlStructure: any = {
      metadata: {
        count: data.length,
        timestamp: new Date().toISOString(),
        export_date: new Date().toLocaleString()
      },
      records: {
        record: cleanData
      }
    };
    
    // Add document metadata if provided
    if (metadata) {
      if (metadata.title) xmlStructure.metadata.title = metadata.title;
      if (metadata.subtitle) xmlStructure.metadata.subtitle = metadata.subtitle;
      if (metadata.author) xmlStructure.metadata.author = metadata.author;
      if (metadata.company) xmlStructure.metadata.company = metadata.company;
      if (metadata.description) xmlStructure.metadata.description = metadata.description;
    }

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      xmlStructure.metadata.filters = {};
      Object.entries(filters).forEach(([key, value]) => {
        xmlStructure.metadata.filters[key] = typeof value === 'object' ? 
          JSON.stringify(value) : String(value);
      });
    }
    
    // Add custom headers if provided
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      xmlStructure.metadata.custom_headers = Object.entries(customHeaders).map(([key, value]) => {
        return {
          header: {
            name: key.replace(/[^a-zA-Z0-9_]/g, '_'),
            value: value
          }
        };
      });
    }
    
    return builder.buildObject(xmlStructure);
  }
  
  /**
   * Format data as PDF
   */
  private async formatPDF(
    data: any[],
    customHeaders?: Record<string, string>,
    filter?: Record<string, any>,
    metadata?: DocumentMetadata,
    totals?: Record<string, number>
  ): Promise<Buffer> {
    this.logger.debug(`PDF export: Formatting ${data.length} records`);
    
    // Define document colors and styles
    const colors = {
      primary: '#2C3E50',
      secondary: '#3498DB',
      accent: '#E74C3C',
      lightGray: '#EEEEEE',
      mediumGray: '#CCCCCC',
      darkGray: '#999999',
      white: '#FFFFFF',
      black: '#333333'
    };
    
    const styles = {
      header: {
        fontSize: 22,
        bold: true,
        color: colors.primary,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        color: colors.primary,
        margin: [0, 10, 0, 5]
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: colors.primary,
        margin: [0, 15, 0, 8]
      },
      normal: {
        fontSize: 10,
        color: colors.black
      },
      tableHeader: {
        fontSize: 12,
        bold: true,
        color: colors.primary
      },
      footer: {
        fontSize: 8,
        color: colors.darkGray,
        margin: [40, 0]
      }
    };
    
    // Prepare column definitions and data for the table
    const columnDefs: { text: string, dataKey: string }[] = [];
    const tableHeaders: any[] = [];
    
    // Determine columns using the first data item
    if (data.length > 0) {
      const firstItem = data[0];
      
      Object.keys(firstItem).forEach(key => {
        // Use the original key as both the display text and data key
        columnDefs.push({ text: key, dataKey: key });
        tableHeaders.push({ 
          text: key, 
          style: 'tableHeader',
          fillColor: colors.lightGray
        });
      });
    }
    
    // Transform data for PDF table format
    const tableRows: any[][] = data.map(item => {
      return columnDefs.map(col => {
        const value = item[col.dataKey];
        return { 
          text: this.formatPdfCellValue(value),
          style: 'normal'
        };
      });
    });
    
    // Add totals row if provided
    if (totals && Object.keys(totals).length > 0) {
      const totalsRow = columnDefs.map((col, index) => {
        if (index === 0) {
          return { 
            text: 'TOTAL', 
            style: 'tableHeader',
            fillColor: colors.lightGray
          };
        }
        
        const value = totals[col.dataKey];
        return {
          text: value !== undefined ? this.formatPdfCellValue(value) : '',
          style: 'tableHeader',
          fillColor: colors.lightGray
        };
      });
      
      tableRows.push(totalsRow);
    }
    
    // Prepare document content
    const content: any[] = [];
    
    // 1. Add title page with metadata, filters, and custom headers all on first page
    if (metadata && (metadata.title || metadata.subtitle || metadata.company)) {
      // Title
      if (metadata.title) {
        content.push({
          text: metadata.title,
          style: 'header',
          alignment: 'center',
          margin: [0, 40, 0, 20]
        });
      }
      
      // Subtitle
      if (metadata.subtitle) {
        content.push({
          text: metadata.subtitle,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 40]
        });
      }
      
      // Company and author info in a table for better alignment
      const infoItems = [];
      
      if (metadata.company) {
        infoItems.push(['Company:', metadata.company]);
      }
      
      if (metadata.author) {
        infoItems.push(['Prepared by:', metadata.author]);
      }
      
      infoItems.push(['Export date:', new Date().toLocaleString()]);
      
      if (infoItems.length > 0) {
        content.push({
          layout: 'noBorders',
          margin: [0, 40, 0, 20],
          table: {
            widths: ['30%', '70%'],
            body: infoItems.map(([label, value]) => [
              { text: label, bold: true, fontSize: 10, color: colors.darkGray },
              { text: value, fontSize: 10 }
            ])
          }
        });
      }
      
      // Description
      if (metadata.description) {
        content.push({
          text: metadata.description,
          fontSize: 12,
          margin: [0, 20, 0, 20]
        });
      }
      
      // Don't add page break here, continue with filters and custom headers
    } else {
      // Simple header if no full metadata
      content.push({
        text: 'Data Export',
        style: 'header',
        margin: [0, 0, 0, 20]
      });
    }
    
    // 2. Add filter section if available (now on same page as metadata)
    if (filter && Object.keys(filter).length > 0) {
      content.push({ text: 'Filters', style: 'sectionTitle' });
      
      const filterRows: any[][] = [];
      
      Object.entries(filter).forEach(([key, value]) => {
        const filterValue = typeof value === 'object' ? 
          JSON.stringify(value) : String(value);
        
        filterRows.push([
          { text: key, bold: true, fontSize: 10 },
          { text: filterValue, fontSize: 10 }
        ]);
      });
      
      content.push({
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20],
        table: {
          widths: ['30%', '70%'],
          headerRows: 0,
          body: filterRows
        }
      });
    }
    
    // 3. Add custom headers section if available (now on same page as metadata)
    if (customHeaders && Object.keys(customHeaders).length > 0) {
      content.push({ text: 'Additional Information', style: 'sectionTitle' });
      
      const headerRows: any[][] = [];
      
      Object.entries(customHeaders).forEach(([key, value]) => {
        headerRows.push([
          { text: key, bold: true, fontSize: 10 },
          { text: value, fontSize: 10 }
        ]);
      });
      
      content.push({
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20],
        table: {
          widths: ['30%', '70%'],
          headerRows: 0,
          body: headerRows
        }
      });
    }
    
    // NOW add the page break after all the metadata, filters and custom headers
    content.push({ text: '', pageBreak: 'after' });
    
    // 4. Data section title
    content.push({ text: 'Data Records', style: 'sectionTitle' });
    
    // Determine if landscape mode is needed based on the number of columns
    const shouldUseLandscape = columnDefs.length > 6 || 
      (columnDefs.length > 4 && data.some(row => {
        return Object.values(row).some(val => 
          typeof val === 'string' && val.length > 30
        );
      }));
    
    // 5. Main data table
    const tableBody = [tableHeaders, ...tableRows];
    
    // Add record count information at the top of the data section
    content.push({
      text: `Total Records: ${data.length}`,
      alignment: 'right',
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 10]
    });
    
    // Calculate optimal column widths to fit the page
    // Page width calculation (A4 is 595 points in portrait, 842 in landscape)
    const pageWidth = shouldUseLandscape ? 842 : 595;
    const margins = 40 * 2; // Left and right margins (40 each)
    const availableWidth = pageWidth - margins - 20; // 20pt extra buffer
    
    // Determine column width distribution based on content
    let tableWidths: any[];
    
    if (columnDefs.length > 0) {
      if (columnDefs.length <= 3) {
        // For few columns, allocate even widths with star notation
        tableWidths = Array(columnDefs.length).fill('*');
      } else {
        // For many columns, allocate percentage widths based on column count
        const colWidth = availableWidth / columnDefs.length;
        
        // Calculate relative widths - analyze content in first few rows to make smart decisions
        const widths = columnDefs.map((col, index) => {
          // Estimate content width based on column header and sample data
          const headerLength = col.text.length;
          
          // Sample some values from this column to estimate width needs
          const sampleRows = Math.min(tableRows.length, 10);
          let avgContentLength = 0;
          
          for (let i = 0; i < sampleRows; i++) {
            if (tableRows[i] && tableRows[i][index] && tableRows[i][index].text) {
              avgContentLength += String(tableRows[i][index].text).length;
            }
          }
          
          if (sampleRows > 0) {
            avgContentLength /= sampleRows;
          }
          
          // Cap width between minimum and maximum
          const contentBasedWidth = Math.max(
            headerLength, 
            Math.min(avgContentLength, 40)
          );
          
          return contentBasedWidth;
        });
        
        // Scale widths to fit total available width
        const totalWidthUnits = widths.reduce((sum, w) => sum + w, 0);
        tableWidths = widths.map(width => {
          const percentage = width / totalWidthUnits;
          return availableWidth * percentage;
        });
      }
    } else {
      tableWidths = ['*']; // Default for empty tables
    }
    
    // Add the table with calculated widths
    content.push({
      table: {
        headerRows: 1,
        widths: tableWidths,
        body: tableBody
      },
      layout: {
        hLineWidth: (i: number, node: any) => {
          return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
        },
        vLineWidth: (i: number) => 0.5,
        hLineColor: (i: number) => i === 1 ? colors.primary : colors.mediumGray,
        vLineColor: () => colors.mediumGray,
        fillColor: (rowIndex: number, node: any, columnIndex: any) => {
          if (rowIndex === 0) {
            return colors.lightGray;
          }
          // For totals row
          if (totals && rowIndex === node.table.body.length - 1) {
            return colors.lightGray;
          }
          // Zebra striping
          return rowIndex % 2 === 0 ? '#F9F9F9' : null;
        },
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 8,
        paddingBottom: () => 8
      }
    });

    // Create the document definition with the table layout
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: shouldUseLandscape ? 'landscape' : 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: content,
      styles: styles,
      defaultStyle: {
        fontSize: 10,
        color: colors.black
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          columns: [
            { 
              text: metadata?.company || '', 
              alignment: 'left',
              style: 'footer'
            },
            { 
              text: `Page ${currentPage.toString()} of ${pageCount}`, 
              alignment: 'right',
              style: 'footer',
              margin: [0, 0, 40, 0]
            }
          ],
          margin: [40, 20]
        };
      },
      info: {
        title: metadata?.title || 'Export Document',
        author: metadata?.author || 'System',
        subject: metadata?.subtitle || '',
        keywords: 'export, data',
        creator: metadata?.company || 'Application',
        producer: metadata?.company || 'Application'
      }
    };
    
    // Create PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);
    
    // Convert to buffer
    return new Promise<Buffer>((resolve, reject) => {
      pdfDoc.getBuffer((buffer: any) => {
        resolve(Buffer.from(buffer));
      });
    });
  }

  /**
   * Format a value for PDF cell display
   */
  private formatPdfCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Format dates nicely
    if (value instanceof Date) {
      return value.toLocaleDateString() + ' ' + 
        value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Format numbers with commas for thousands
    if (typeof value === 'number') {
      // Format currency with 2 decimal places if it looks like money
      if (Number.isFinite(value) && 
          (String(value).includes('.') || value > 1000 || value === 0)) {
        return value.toLocaleString(undefined, { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
      // Integer formatting
      return value.toLocaleString();
    }
    
    // Format boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Format objects (like JSON data)
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Complex Object]';
      }
    }
    
    return String(value);
  }
  
  /**
   * Calculate totals for numeric columns
   */
  private calculateColumnTotals(data: any[]): Record<string, number> {
    if (!data || data.length === 0) return {};
    
    const totals: Record<string, number> = {};
    const numericColumns = new Set<string>();
    
    // First pass: identify numeric columns
    data.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        // Check if the value is a number
        if (typeof value === 'number') {
          numericColumns.add(key);
        }
      });
    });
    
    // Second pass: calculate totals for numeric columns
    numericColumns.forEach(column => {
      totals[column] = data.reduce((sum, row) => {
        const value = row[column];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    });
    
    return totals;
  }

/**
 * Import data into a repository from the provided content with enhanced features
 * @param service - Base service to handle database operations
 * @param content - File content as Buffer or string
 * @param options - Import configuration options
 */
async importData<T extends BaseEntity<T>>(
  service: BaseService<T>,
  content: Buffer | string,
  options: ImportOptionsDto<T>,
  userId: string
): Promise<ImportResult> {
  const startTime = Date.now();
  this.logger.log(`Beginning import operation with format: ${options.format}`);
  
  try {
    // Set default options
    const importOptions = {
      batchSize: 100,
      validate: true,
      useTransaction: true,
      updateExisting: false,
      ...options
    };

    // Parse the input data based on the format
    const parsedData = await this.parseInput(content, importOptions.format);
    
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      throw new BadRequestException('No valid data found to import');
    }
    
    this.logger.log(`Parsed ${parsedData.length} records from ${importOptions.format} file`);
    
    // Validate max records limit if specified
    if (importOptions.maxRecords && parsedData.length > importOptions.maxRecords) {
      throw new BadRequestException(
        `Import exceeds maximum record limit (${importOptions.maxRecords}). Found ${parsedData.length} records.`
      );
    }
    
    // Apply field mapping if specified
    const mappedData = importOptions.fieldMap 
      ? this.mapFields(parsedData, importOptions.fieldMap, true) 
      : parsedData;

    // Prepare result object with metadata
    const result: ImportResult = {
      totalRecords: mappedData.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      created: [],
      updated: [],
      skipped: [],
      importTime: 0,
      metadata: {
        format: importOptions.format,
        startTime: new Date().toISOString(),
        userId,
        batchSize: importOptions.batchSize,
        withValidation: importOptions.validate
      }
    };
    
    // Get entity class from service
    const entityClass = service.getRepository().target as EntityTarget<T>;

    // Perform dry run if requested
    if (importOptions.dryRun) {
      this.logger.log('Performing dry run validation without saving data');
      await this.validateImportBatch(
        service,
        mappedData,
        importOptions,
        result,
        entityClass
      );
      
      result.importTime = Date.now() - startTime;
      result.metadata.endTime = new Date().toISOString();
      result.metadata.dryRun = true;
      
      this.logger.log(`Dry run completed in ${result.importTime}ms. Errors: ${result.errorCount}`);
      return result;
    }
    
    // Process the actual import
    try {
      // Process in transaction
      await this.dataSource.transaction(async transactionManager => {
        await this.processImportBatch(
          service,
          mappedData,
          importOptions,
          result,
          entityClass,
          userId,
          transactionManager
        );
      });
    } catch (error: any) {
      this.logger.error(`Transaction error during import: ${error.message}`);
      // Add transaction error to the results
      result.errors.push({
        record: null,
        error: `Transaction failed: ${error.message}`,
        type: 'transaction'
      });
      result.errorCount++;
    }
    
    // Calculate total time and set metadata
    result.importTime = Date.now() - startTime;
    result.metadata.endTime = new Date().toISOString();
    
    this.logger.log(`Import completed in ${result.importTime}ms. Created: ${result.created.length}, ` + 
                   `Updated: ${result.updated.length}, Skipped: ${result.skipped.length}, Errors: ${result.errorCount}`);
    
    return result;
  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    this.logger.error(`Error during import process (${errorTime}ms): ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Validate import data without committing changes
 */
private async validateImportBatch<T extends BaseEntity<T>>(
  service: BaseService<T>,
  records: any[],
  options: ImportOptionsDto<T>,
  result: ImportResult,
  entityClass: EntityTarget<T>
): Promise<void> {
  const batchSize = options.batchSize || 100;
  
  // Process in batches to avoid memory issues with large imports
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    // For each record in the batch
    for (let j = 0; j < batch.length; j++) {
      const record = batch[j];
      const rowNumber = i + j + 1; // 1-based row number for user-friendly messages
      
      try {
        // Transform to entity instance for validation if dtoClass is provided
        let entityDto = record;
        
        // Determine if this is a new record or an update
        let existingRecord: T | null = null;
        if (options.identifierField && record[options.identifierField as string]) {
          const criteria = {
            [options.identifierField as string]: record[options.identifierField as string]
          } as unknown as Partial<T>;
          
          existingRecord = await service.findOneBy(criteria);
        }
        
        // Record the action that would be taken
        if (existingRecord) {
          result.updated.push(existingRecord.id);
          result.successCount++;
        } else if (!existingRecord) {
          // This would be a creation
          result.created.push(`row-${rowNumber}`);
          result.successCount++;
        } else {
          // Record exists but updateExisting is false
          const recordId = options.identifierField && record[options.identifierField as string]
            ? record[options.identifierField as string] 
            : `row-${rowNumber}`;
          
          result.skipped.push(String(recordId));
        }
        
      } catch (error) {
        this.handleImportError(record, error, result, 'system', rowNumber);
      }
    }
  }
}
  
/**
 * Process a batch of records for import with performance optimizations
 */
private async processImportBatch<T extends BaseEntity<T>>(
  service: BaseService<T>,
  records: any[],
  options: ImportOptionsDto<T>,
  result: ImportResult,
  entityClass: EntityTarget<T>,
  userId: string,
  transactionManager?: EntityManager,
): Promise<void> {
  const batchSize = options.batchSize || 100;
  const repo = transactionManager ? transactionManager.getRepository(entityClass) : service.getRepository();
  
  // Track entities for potential bulk operations
  const entitiesToCreate: DeepPartial<T>[] = [];
  const entitiesToUpdate: Array<{ id: string, entity: DeepPartial<T> }> = [];
  
  // Process in batches to avoid memory issues with large imports
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    this.logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
    
    // First pass: validate all records in batch
    let hasErrors = false;
    
    for (let j = 0; j < batch.length; j++) {
      const record = batch[j];
      const rowNumber = i + j + 1;
      
      try {
        // Transform and validate
        let entityDto = record;
        
        // Check if record exists
        if (options.identifierField && record[options.identifierField as string]) {
          const criteria = {
            [options.identifierField as string]: record[options.identifierField as string]
          } as unknown as Partial<T>;
          
          const existingRecord = await service.findOneBy(criteria);
          
          if (existingRecord) {
            result.skipped.push(String(record[options.identifierField as string]));
            continue;
          }
        }
      } catch (error) {
        this.handleImportError(record, error, result, 'system', rowNumber);
        hasErrors = true;
      }
    }
    
    // If any validation errors in this batch, skip further processing
    if (hasErrors) {
      continue;
    }
    
    
    // Second pass: process records
    for (let j = 0; j < batch.length; j++) {
      const record = batch[j];
      const rowNumber = i + j + 1;
      
      try {
        // Transform to entity instance for validation if dtoClass is provided
        let entityDto = record;
        
        // Determine if this is a new record or an update
        let existingRecord: T | null = null;
        if (options.identifierField && record[options.identifierField as string]) {
          const criteria = {
            [options.identifierField as string]: record[options.identifierField as string]
          } as unknown as Partial<T>;
          
          existingRecord = await service.findOneBy(criteria);
        }
        
        // Create or update the record
        if (existingRecord) {
          // Add to batch update list
            entitiesToUpdate.push({
              id: existingRecord.id,
              entity: {
                ...entityDto as DeepPartial<T>,
                updatedBy: userId
              }
            });
        } else if (!existingRecord) {
          // Add to batch creation list
            entitiesToCreate.push({
              ...entityDto as DeepPartial<T>,
              createdBy: userId
            });
        } else {
          // Record exists but updateExisting is false
          if (options.identifierField && record[options.identifierField as string]) {
            result.skipped.push(String(record[options.identifierField as string]));
          } else {
            result.skipped.push(`row-${rowNumber}`);
          }
        }
      } catch (error) {
        this.handleImportError(record, error, result, 'system', rowNumber);
      }
    }
    
    // Process bulk operations if collected
    try {
      // Bulk create
      if (entitiesToCreate.length > 0) {
        const entities = repo.create(entitiesToCreate);
        const savedEntities = await repo.save(entities);
        
        savedEntities.forEach(entity => {
          result.created.push(entity.id);
          result.successCount++;
        });
        
        entitiesToCreate.length = 0; // Clear array
      }
      
      // Bulk update
      for (const item of entitiesToUpdate) {
        await repo.update(item.id, item.entity as any);
        result.updated.push(item.id);
        result.successCount++;
      }
      
      entitiesToUpdate.length = 0; // Clear array
    } catch (bulkError: any) {
      this.logger.error(`Error in bulk operation: ${bulkError.message}`, bulkError.stack);
      
      // Add error for each record that was being processed
      [...entitiesToCreate, ...entitiesToUpdate.map(item => item.entity)].forEach(entity => {
        result.errorCount++;
        result.errors.push({
          record: entity,
          error: `Bulk operation failed: ${bulkError.message}`,
          type: 'database'
        });
      });
      
      entitiesToCreate.length = 0;
      entitiesToUpdate.length = 0;
    }
  }
}
  
/**
 * Enhanced error handling with categorization and row numbers
 */
private handleImportError(
  record: any, 
  error: any, 
  result: ImportResult, 
  errorType: 'validation' | 'custom-validation' | 'database' | 'system' | 'transaction' | 'transformation' = 'system',
  rowNumber?: number
): void {
  result.errorCount++;
  
  let errorMessage = 'Unknown error';
  let errorDetails: any = [];
  
  // Format error message based on error type
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (Array.isArray(error)) {
    // Handle validation errors
    errorMessage = 'Validation failed';
    errorDetails = error.map((e: ValidationError) => {
      const constraints = Object.values(e.constraints || {}).join('; ');
      return `${e.property}: ${constraints}`;
    });
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  const rowPrefix = rowNumber ? `Row ${rowNumber}: ` : '';
  
  result.errors.push({
    record,
    error: `${rowPrefix}${errorMessage}${errorDetails.length ? ': ' + errorDetails.join(', ') : ''}`,
    type: errorType,
    row: rowNumber
  });
}
  
/**
 * Parse input content based on format with enhanced error handling
 */
private async parseInput(content: Buffer | string, format: FileFormat): Promise<any[]> {
  try {
    switch (format) {
      case FileFormat.CSV:
        return this.parseCSV(content.toString());
        
      case FileFormat.EXCEL:
        return this.parseExcel(content as Buffer);
        
      case FileFormat.JSON:
        return this.parseJSON(content.toString());
        
      default:
        throw new BadRequestException(`Unsupported import format: ${format}`);
    }
  } catch (error: any) {
    this.logger.error(`Error parsing input: ${error.message}`, error.stack);
    
    // Enhance error message with format-specific context
    let enhancedMessage = `Failed to parse ${format} input: ${error.message}`;
    
    if (format === FileFormat.CSV) {
      enhancedMessage += '. Please check CSV formatting, including delimiters and quotes.';
    } else if (format === FileFormat.EXCEL) {
      enhancedMessage += '. Please check that the Excel file is valid and not password-protected.';
    } else if (format === FileFormat.JSON) {
      enhancedMessage += '. Please ensure valid JSON formatting.';
    }
    
    throw new BadRequestException(enhancedMessage);
  }
}
  
  /**
   * Map fields using a field map configuration
   */
  private mapFields(data: any[], fieldMap: Record<string, string>, isImport = false): any[] {
    return data.map(item => {
      const result: Record<string, any> = {};
      
      if (isImport) {
        // For import: map from external names to internal names
        Object.keys(item).forEach(externalField => {
          // Find the internal field name that maps to this external field
          const internalField = Object.entries(fieldMap)
            .find(([_, ext]) => ext === externalField)?.[0];
            
          if (internalField) {
            result[internalField] = item[externalField];
          } else if (!fieldMap || Object.keys(fieldMap).length === 0) {
            // If no mapping specified, keep original fields
            result[externalField] = item[externalField];
          }
        });
      } else {
        // For export: map from internal names to external names
        Object.keys(fieldMap).forEach(internalField => {
          if (item[internalField] !== undefined) {
            const externalField = fieldMap[internalField];
            result[externalField] = item[internalField];
          }
        });
        
        // Include fields not in the mapping if no mapping specified
        if (!fieldMap || Object.keys(fieldMap).length === 0) {
          Object.assign(result, item);
        }
      }
      
      return result;
    });
  }
  
  /**
   * Parse CSV content
   */
  private parseCSV(content: string): any[] {
    const result = Papa.parse(content, { 
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    if (result.errors && result.errors.length > 0) {
      const errorMsg = result.errors.map(e => e.message).join('; ');
      throw new BadRequestException(`CSV parsing errors: ${errorMsg}`);
    }
    
    return result.data;
  }
  
  /**
   * Parse Excel content
   */
  private parseExcel(content: Buffer): any[] {
    const workbook = XLSX.read(content, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    return XLSX.utils.sheet_to_json(sheet, { defval: null });
  }
  
  /**
   * Parse JSON content
   */
  private parseJSON(content: string): any[] {
    const parsed = JSON.parse(content);
    
    // Handle both array and object formats
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Some APIs return { data: [...] }
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      // Single object case
      return [parsed];
    }
    
    throw new BadRequestException('Invalid JSON format: must be an array or object with data property');
  }
}