import { BaseDto } from "@/common/dtos/base.dto";
import { CutoffStatus } from "@/common/enums/cutoff-status.enum";
import { CutoffType } from "@/common/enums/cutoff-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CutoffDto extends PartialType(BaseDto) {
    @ApiProperty({
        description: 'Description of the cutoff period',
        example: 'First half of January 2023',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Start date of the cutoff period',
        example: '2023-01-01',
        type: Date
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate!: Date;

    @ApiProperty({
        description: 'End date of the cutoff period',
        example: '2023-01-15',
        type: Date
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    endDate!: Date;

    @ApiProperty({
        description: 'Status of the cutoff period',
        enum: CutoffStatus,
        example: CutoffStatus.ACTIVE,
        default: CutoffStatus.ACTIVE,
        required: true
    })
    @IsNotEmpty()
    @IsEnum(CutoffStatus)
    status!: CutoffStatus;

    @ApiProperty({
        description: 'Type of the cutoff period',
        enum: CutoffType,
        example: CutoffType.BI_WEEKLY,
        default: CutoffType.BI_WEEKLY,
        required: true
    })
    @IsNotEmpty()
    @IsEnum(CutoffType)
    cutoffType!: CutoffType;
}

export class UpdateCutoffDto extends PartialType(CutoffDto) {}

export class GetCutoffDto extends createGetDto(CutoffDto, 'cutoff') {}