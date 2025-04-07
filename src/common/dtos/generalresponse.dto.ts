import { ApiProperty } from '@nestjs/swagger';

export class GeneralResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 404,
    type: Number,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2025-04-07T02:04:20.545Z',
    type: String,
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Unique identifier for tracking the request',
    example: 'dfed434d-9516-4ae3-975e-175df199dd01',
    type: String,
  })
  traceId!: string;

  @ApiProperty({
    description: 'Request path that triggered this response',
    example: '/api/modules',
    type: String,
  })
  path!: string;

  @ApiProperty({
    description: 'Type of exception or error that occurred',
    example: 'NotFoundException',
    type: String,
  })
  detail!: string;

  @ApiProperty({
    description: 'Error message or messages describing the issue',
    example: 'Cannot GET /api/modules',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } }
    ]
  })
  message!: string | string[];
}