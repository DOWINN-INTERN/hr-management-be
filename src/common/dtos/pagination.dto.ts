import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsPositive()
  @Min(1)
  take?: number;
}
