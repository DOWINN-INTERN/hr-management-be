import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import 'reflect-metadata';

export function ApiQueryFromDto(dtoClass: any) {
  // Get all properties with @ApiProperty/@ApiPropertyOptional decorators
  const prototype = dtoClass.prototype;
  const props = Reflect.getMetadata('swagger/apiModelPropertiesArray', prototype) || [];
  
  // Create an array of ApiQuery decorators for each property
  const decorators = props.map((prop: any) => {
    const propertyName = prop.name;
    const propertyMetadata = Reflect.getMetadata(
      'swagger/apiModelProperties',
      prototype,
      propertyName,
    );
    
    // Skip functions and complex types that can't be represented in URL
    if (['function', 'object'].includes(typeof propertyMetadata?.type)) {
      return null;
    }

    return ApiQuery({
      name: propertyName,
      type: propertyMetadata?.type || String,
      required: !propertyMetadata?.isOptional,
      enum: propertyMetadata?.enum,
      description: propertyMetadata?.description || '',
      example: propertyMetadata?.example,
    });
  }).filter(Boolean); // Filter out nulls for skipped properties
  
  return applyDecorators(...decorators);
}