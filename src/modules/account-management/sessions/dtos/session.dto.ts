import { createGetDto } from "@/common/utils/create-get-dto";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SessionDto
{
    @ApiProperty({ example: 'userId123', description: 'The ID of the user' })
    @IsString()
    @IsNotEmpty()
    userId?: string;

    @ApiProperty({ example: 'refreshToken123', description: 'The refresh token for the session' })
    @IsString()
    @IsNotEmpty()
    refreshToken?: string;
}

export class UpdateSessionDto extends PartialType(SessionDto) {}

export class GetSessionDto extends createGetDto(SessionDto) {}