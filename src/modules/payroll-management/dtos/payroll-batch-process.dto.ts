import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    ValidateNested
} from "class-validator";

class BatchInfo {
    @ApiProperty({
        description: 'Unique identifier for the batch',
        example: '123e4567-ef00-1234-5678-1234567890ab',
        format: 'uuid'
    })
    @IsUUID(4, { message: 'batchId must be a valid UUID v4' })
    @IsNotEmpty()
    batchId!: string;

    @ApiProperty({
        description: 'Number of employees in this batch',
        example: 100,
        minimum: 1
    })
    @IsNumber()
    @IsPositive({ message: 'employeeCount must be a positive number' })
    employeeCount!: number;
}

export class PayrollBatchProcessRequestDto {
    @ApiProperty({
        description: 'ID of the cutoff for which payroll is to be processed',
        example: '123e4567-ef00-1234-5678-1234567890ab',
        format: 'uuid'
    })
    @IsUUID(4, { message: 'cutoffId must be a valid UUID v4' })
    @IsNotEmpty()
    cutoffId!: string;
        
    @ApiPropertyOptional({
        description: 'Batch size for processing payroll items',
        example: 100,
        default: 100,
        minimum: 1
    })
    @IsOptional()
    @IsNumber()
    @IsPositive({ message: 'batchSize must be a positive number' })
    batchSize?: number;
}

export class PayrollBatchProcessResponseDto extends PayrollBatchProcessRequestDto {
    @ApiProperty({
        description: 'Response message',
        example: 'Payroll batch processing initiated successfully'
    })
    @IsString()
    @IsNotEmpty()
    message!: string;

    @ApiProperty({
        description: 'Total number of batches created for processing',
        example: 5,
        minimum: 1
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    batchCount!: number;

    @ApiProperty({
        description: 'List of batches created for processing',
        type: [BatchInfo]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BatchInfo)
    @IsNotEmpty()
    batches!: BatchInfo[];

    @ApiProperty({
        description: 'Estimated time for completion of the batch processing',
        example: '2023-10-01T12:00:00Z',
        format: 'date-time'
    })
    @IsISO8601()
    @IsNotEmpty()
    estimatedCompletionTime!: string;
}