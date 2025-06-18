import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";

export class ScheduleGenerationDto {
    @ApiProperty({
        description: 'List of employee IDs to generate schedules for',
        type: [String],
        example: ['emp123', 'emp456']
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    employeeIds!: string[];

    @ApiProperty({
        description: 'Cutoff ID for which to generate schedules',
        type: String,
        example: 'cutoff123'
    })
    @IsString()
    @IsNotEmpty()
    cutoffId!: string;
}