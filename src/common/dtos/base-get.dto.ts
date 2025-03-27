import { ApiProperty } from '@nestjs/swagger';

export class BaseGetDTO<T> {
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

  // This is a special static method that will be used to create derived DTOs
  static create<Dto, Entity extends BaseGetDTO<Dto>>(
    dtoClass: new () => Dto
  ): new () => Entity {
    class GetEntityDTO extends this<Dto> {
      constructor() {
        super();
      }
    }

    // Copy all properties and decorators from the DTO class
    const dtoPrototype = dtoClass.prototype;
    const propertyNames = Object.getOwnPropertyNames(dtoPrototype);
    
    for (const propertyName of propertyNames) {
      if (propertyName === 'constructor') continue;
      
      // Copy property
      Object.defineProperty(
        GetEntityDTO.prototype,
        propertyName,
        Object.getOwnPropertyDescriptor(dtoPrototype, propertyName) || {}
      );
      
      // Copy metadata (for decorators)
      const metadataKeys = Reflect.getMetadataKeys(dtoPrototype, propertyName);
      for (const metadataKey of metadataKeys) {
        const metadata = Reflect.getMetadata(metadataKey, dtoPrototype, propertyName);
        Reflect.defineMetadata(metadataKey, metadata, GetEntityDTO.prototype, propertyName);
      }
    }

    // Set the class name dynamically
    Object.defineProperty(GetEntityDTO, 'name', {
      value: `Get${dtoClass.name}`
    });

    return GetEntityDTO as any;
  }
}