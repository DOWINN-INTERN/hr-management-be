import { Occurrence } from '@/common/enums/occurrence.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class EmployeeCompensationDto {
    @ApiProperty({
        description: 'The type of rate occurrence',
        enum: Occurrence,
        example: Occurrence.MONTHLY,
    })
    @IsNotEmpty()
    @IsEnum(Occurrence)
    rateType!: Occurrence;

    @ApiProperty({
        description: 'The compensation amount',
        example: 30000,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount!: number;
}