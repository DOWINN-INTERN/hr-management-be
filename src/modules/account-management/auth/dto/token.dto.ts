import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class TokenDto {
    @ApiProperty({
        description: 'Unique identifier token',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    token!: string;
}