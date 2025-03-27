import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from "./pagination.dto";

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true, description: 'Array of items' })
  data: T[] = [];

  @ApiProperty({ description: 'Total number of items', example: 100 })
  totalCount: number = 0;

  @ApiProperty({ description: 'Pagination metadata' })
  meta: PaginationDto<T> = new PaginationDto();
}