import { ApiProperty } from '@nestjs/swagger';

export class ChunkUploadResult {
  @ApiProperty({ description: 'Upload ID for the chunked upload' })
  uploadId!: string;

  @ApiProperty({ description: 'Chunk number that was processed' })
  chunkNumber!: number;

  @ApiProperty({ description: 'Size of the received chunk in bytes' })
  receivedSize!: number;

  @ApiProperty({ description: 'Total number of chunks received so far' })
  totalChunksReceived!: number;

  @ApiProperty({ description: 'Whether all chunks have been received' })
  completed!: boolean;
}