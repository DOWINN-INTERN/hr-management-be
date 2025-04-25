import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FilterCondition {
  // The field to filter on (e.g., 'email', 'name', 'user.email')
  field: string;
  
  // The value to compare against (use null to get from config)
  value?: any;
  
  // The name of the config key (if value should be retrieved from config)
  configKey?: string;
  
  // How to compare (e.g., 'ne' for not equal, 'eq' for equal)
  comparator?: string;
}

// Define an interface with the methods we expect to override
interface BaseControllerMethods {
    findAllAdvanced(paginationDto: PaginationDto<any>): Promise<PaginatedResponseDto<any>>;
    findOne(fieldsString: string, relations?: string, select?: string): Promise<any>;
}
  
export function withEntityFilter<T extends Type<BaseControllerMethods>>(
    BaseController: T, 
    filterConditions: FilterCondition[]
) {
  return class extends BaseController {
    private readonly resolvedFilters: Array<{field: string, value: any, comparator: string}> = [];
    
    constructor(...args: any[]) {
      super(...args);
      
      // Find ConfigService in the args
      const configService = args.find(arg => arg instanceof ConfigService);
      
      // Resolve all filter conditions
      this.resolvedFilters = filterConditions.map(condition => {
        const { field, value, configKey, comparator = 'ne' } = condition;
        
        // Determine the actual value to filter by
        let resolvedValue = value;
        if (resolvedValue === null && configKey && configService) {
          resolvedValue = configService.get<any>(configKey);
        }
        
        if (resolvedValue === undefined) {
          console.warn(`EntityFilter: Could not determine filter value for ${field}`);
        }
        
        return { field, value: resolvedValue, comparator };
      });
    }
    
    async findAllAdvanced(
      paginationDto: PaginationDto<any>
    ): Promise<PaginatedResponseDto<any>> {
      // Create a modified pagination DTO
      const modifiedPaginationDto = new PaginationDto<any>();
      Object.assign(modifiedPaginationDto, paginationDto);
      
      // Initialize filter if not present
      if (!modifiedPaginationDto.filter) {
        modifiedPaginationDto.filter = {} as Record<string, any>;
      }
      
      // Apply all filter conditions
      this.resolvedFilters.forEach(({ field, value, comparator }) => {
        if (value === undefined) return;
        
        // Handle nested fields like 'user.email'
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          const filterAsRecord = modifiedPaginationDto.filter as Record<string, any>;
          filterAsRecord[parent] = {
            ...(filterAsRecord[parent] || {}),
            [child]: { [comparator]: value }
          };
        } else {
          // Handle direct fields like 'email'
          (modifiedPaginationDto.filter as Record<string, any>)[field] = { 
            ...((modifiedPaginationDto.filter as Record<string, any>)[field] || {}),
            [comparator]: value 
          };
        }
      });
      
      // Call the parent method
      return super.findAllAdvanced(modifiedPaginationDto);
    }
    
    async findOne(
      fieldsString: string, 
      relations?: string, 
      select?: string
    ): Promise<any> {
      // Apply all filter conditions to the fieldsString
      this.resolvedFilters.forEach(({ field, value, comparator }) => {
        if (value === undefined) return;
        
        // Format the condition based on the filter field and comparator
        const condition = `${field}${comparator === 'ne' ? '!=' : '='}${value}`;
        
        // Add filter condition to fieldsString
        if (!fieldsString.includes(field)) {
          fieldsString = fieldsString 
            ? `${fieldsString},${condition}` 
            : condition;
        } else if (!fieldsString.includes(condition)) {
          // If it contains the field but not our condition, we need to replace
          const fieldPattern = new RegExp(`${field}:[^,]+`);
          if (fieldsString.match(fieldPattern)) {
            fieldsString = fieldsString.replace(fieldPattern, condition);
          } else {
            fieldsString = `${fieldsString},${condition}`;
          }
        }
      });
      
      return super.findOne(fieldsString, relations, select);
    }
  };
}