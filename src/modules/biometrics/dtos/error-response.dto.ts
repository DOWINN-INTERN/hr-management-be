import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for biometrics API error responses
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 400,
    type: Number,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message or messages describing the issue',
    example: 'Failed to connect to device',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } }
    ]
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Error code for client identification',
    example: 'DEVICE_CONNECTION_ERROR',
    type: String,
  })
  code?: string;

  @ApiProperty({
    description: 'Additional error details or context',
    example: 'Device might be offline or credentials are invalid',
    type: String,
    required: false
  })
  detail?: string;
}