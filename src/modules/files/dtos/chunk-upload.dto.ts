import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ChunkUploadDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Chunk of file data'
    })
    chunk: any;

    @ApiProperty({
        type: 'number',
        description: 'Chunk sequence number (0-based index)',
        example: 0
    })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    chunkNumber!: number;

    @ApiProperty({
        type: 'string',
        description: 'MD5 hash of the chunk for integrity verification',
        example: 'd41d8cd98f00b204e9800998ecf8427e'
    })
    @IsString()
    @IsOptional()
    chunkHash?: string;
}