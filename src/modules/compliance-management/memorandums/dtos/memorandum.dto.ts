import { BaseDto } from "@/common/dtos/base.dto";
import { MemoStatus } from "@/common/enums/memo-status.enum";
import { MemoType } from "@/common/enums/memo-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    ValidateNested
} from "class-validator";

class MemorandumRecipientDto {
    @ApiProperty({ description: 'Recipient ID' })
    @IsUUID()
    recipientId!: string;
}

class MemorandumFlowDto {
    @ApiProperty({ description: 'Approver ID' })
    @IsUUID()
    approverId!: string;
    
    @ApiProperty({ description: 'Flow order' })
    @IsNotEmpty()
    order!: number;
}

export class MemorandumDto extends BaseDto {
    @ApiProperty({ description: 'Title of the memorandum', maxLength: 200 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    title!: string;
    
    @ApiProperty({ description: 'Content of the memorandum' })
    @IsNotEmpty()
    @IsString()
    content!: string;
    
    @ApiProperty({ description: 'Type of memorandum', enum: MemoType })
    @IsNotEmpty()
    @IsEnum(MemoType)
    type!: MemoType;
    
    @ApiPropertyOptional({ description: 'Effective date of memorandum' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    effectiveDate?: Date;
    
    @ApiPropertyOptional({ description: 'Compliance date of memorandum' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    complianceDate?: Date;
    
    @ApiProperty({ description: 'Issuer ID' })
    @IsUUID()
    @IsNotEmpty()
    issuerId!: string;
    
    @ApiPropertyOptional({ description: 'Template ID' })
    @IsOptional()
    @IsUUID()
    templateId?: string;
    
    @ApiPropertyOptional({ description: 'Recipients of memorandum', type: [MemorandumRecipientDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MemorandumRecipientDto)
    recipients?: MemorandumRecipientDto[];
    
    @ApiPropertyOptional({ description: 'Approval flows', type: [MemorandumFlowDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MemorandumFlowDto)
    approvalFlows?: MemorandumFlowDto[];
}

export class UpdateMemorandumDto extends PartialType(MemorandumDto) {
    @ApiPropertyOptional({ description: 'Status of memorandum', enum: MemoStatus, default: MemoStatus.DRAFT })
    @IsEnum(MemoStatus)
    @IsOptional()
    status?: MemoStatus;
}

export class GetMemorandumDto extends createGetDto(MemorandumDto, 'memorandum') {
    @ApiPropertyOptional({ description: 'Issue date of memorandum' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    issueDate?: Date;
}