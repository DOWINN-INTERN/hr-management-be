import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class RecalculateOptionsDto {
    @ApiProperty({
        description: 'Whether to preserve the current state during recalculation',
        example: true,
    })
    @IsNotEmpty({ message: 'preserveState is required' })
    @IsBoolean({ message: 'preserveState must be a boolean value' })
    preserveState!: boolean;

    @ApiPropertyOptional({
        description: 'Whether to recalculate deductions',
        example: true,
        default: true
    })
    @IsBoolean({ message: 'recalculateDeductions must be a boolean value' })
    @IsOptional()
    recalculateDeductions?: boolean;

    @ApiPropertyOptional({
        description: 'Whether to recalculate allowances',
        example: true,
        default: true,
    })
    @IsBoolean({ message: 'recalculateAllowances must be a boolean value' })
    @IsOptional()
    recalculateAllowances?: boolean;
}