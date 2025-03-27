import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';
import { RoleDto } from '@/modules/employee-management/roles/dtos/role.dto';

export class GetUserDto extends UpdateUserDto {

    roles?: RoleDto[];

    @ApiProperty({ example: 'google', description: 'The provider of the user', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    provider?: string;

    @ApiProperty({ example: 'googleId', description: 'The provider ID of the user', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    providerId?: string;

    @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The last login time of the user', required: false })
    @IsOptional()
    @IsDate()
    @Expose()
    lastLogin?: Date;

    @ApiProperty({ example: 0, description: 'The number of failed login attempts' })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    accessFailedCount!: number;

    @ApiProperty({ 
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
        description: 'The refresh token of the user', 
        required: false 
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    @Expose()
    refreshToken?: string;

    constructor(partial: Partial<GetUserDto>) {
        super();
        Object.assign(this, partial);
    }
}