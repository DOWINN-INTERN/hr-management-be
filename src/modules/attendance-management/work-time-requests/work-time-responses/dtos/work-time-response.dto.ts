import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

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
        description: 'Work time request associated with this response',
        type: ReferenceDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    workTimeRequest?: ReferenceDto;
}

export class UpdateWorkTimeResponseDto extends PartialType(WorkTimeResponseDto) {}

export class GetWorkTimeResponseDto extends createGetDto(UpdateWorkTimeResponseDto, 'work time response') {}