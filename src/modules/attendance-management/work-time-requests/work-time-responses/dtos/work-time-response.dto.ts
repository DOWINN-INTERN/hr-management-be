import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class WorkTimeResponseDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Approval status of the work time request',
        example: true 
    })
    @IsBoolean()
    @IsNotEmpty()
    approved!: boolean;
    
    @ApiProperty({ 
        description: 'Response message for the work time request',
        example: 'Your work time request has been approved.' 
    })
    @IsString()
    @IsNotEmpty()
    message!: string;

    @ApiProperty({ 
        description: 'ID of the related work time request',
        example: '123e4567-e89b-12d3-a456-426614174000' 
    })
    @IsUUID()
    @IsNotEmpty()
    workTimeRequestId!: string;
}

export class UpdateWorkTimeResponseDto extends PartialType(WorkTimeResponseDto) {}

export class GetWorkTimeResponseDto extends createGetDto(UpdateWorkTimeResponseDto, 'work time response') {}