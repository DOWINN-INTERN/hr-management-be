import { ApiProperty } from '@nestjs/swagger';

/**
 * Creates a Data Transfer Object (DTO) class for GET operations by extending the provided DTO
 * with standard entity metadata fields such as id, timestamps, and soft-delete information.
 * 
 * This utility automatically copies all properties and decorators from the source DTO
 * and adds standardized tracking fields like creation date, update date, etc. The resulting
 * class is dynamically named with the pattern `Get${originalClassName}`.
 * 
 * @template T - The type of the DTO class to extend
 * @param {new () => T} dto - The DTO class constructor to extend with metadata fields
 * @returns {any} A new DTO class that extends the original with standard entity metadata fields
 * 
 * @remarks
 * The returned class includes the following additional fields:
 * - id: Unique identifier for the entity
 * - createdAt: Timestamp of entity creation
 * - updatedAt: Timestamp of last update (nullable)
 * - createdBy: ID of the user who created the entity (nullable)
 * - updatedBy: ID of the user who last updated the entity (nullable)
 * - isDeleted: Flag indicating if the entity is soft-deleted
 * - deletedBy: ID of the user who deleted the entity (nullable)
 * - deletedAt: Timestamp of entity deletion (nullable)
 * 
 * @example
 * ```typescript
 * // Define a base DTO
 * class UserDto {
 *   @ApiProperty()
 *   name: string;
 * 
 *   @ApiProperty()
 *   email: string;
 * }
 * 
 * // Create a GetUserDto with all standard metadata fields
 * const GetUserDto = createGetDto(UserDto);
 * ```
 */
export function createGetDto<T>(dto: new () => T): any {
  class GetDto {
    @ApiProperty({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id!: string;

    @ApiProperty({
        description: 'Date when the entity was created',
        example: '2023-01-01T00:00:00Z',
        type: Date
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Date when the entity was last updated',
        example: '2023-01-02T00:00:00Z',
        type: Date,
        nullable: true
    })
    updatedAt?: Date;

    @ApiProperty({
        description: 'ID of the user who created this entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    createdBy?: string;

    @ApiProperty({
        description: 'ID of the user who last updated this entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    updatedBy?: string;

    @ApiProperty({
        description: 'Whether this entity is marked as deleted',
        example: false,
        default: false
    })
    isDeleted!: boolean;

    @ApiProperty({
        description: 'ID of the user who deleted this entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    })
    deletedBy?: string;

    @ApiProperty({
        description: 'Date when the entity was deleted',
        example: '2023-01-03T00:00:00Z',
        type: Date,
        nullable: true
    })
    deletedAt?: Date;

    constructor(partial: Partial<T & GetDto>) {
      Object.assign(this, partial);
    }
  }

  // Copy properties and decorators from the source DTO
  const prototype = dto.prototype;
  Reflect.ownKeys(prototype).forEach(key => {
    if (key === 'constructor') return;
    
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    if (descriptor) {
      Object.defineProperty(GetDto.prototype, key, descriptor);
    }
  });

  // Rename the class
  Object.defineProperty(GetDto, 'name', { value: `Get${dto.name}` });

  return GetDto;
}