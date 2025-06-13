import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';

export function ApiGenericResponses() {
    return applyDecorators(
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Bad Request - Invalid input data',
            type: GeneralResponseDto,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized - Authentication required',
            type: GeneralResponseDto,
        }),
        ApiResponse({
            status: HttpStatus.FORBIDDEN,
            description: 'Forbidden - Insufficient permissions',
            type: GeneralResponseDto,
        }),
        ApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            description: 'Internal Server Error',
            type: GeneralResponseDto,
        }),
    );
}

// CRUD Operation Specific Decorators
export function ApiCreateResponses(entity: string, getDtoClass: any) {
    return applyDecorators(
        ApiResponse({ 
            status: HttpStatus.CREATED, 
            description: `${entity} has been successfully created.`,
            type: getDtoClass
        }),
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: `Conflict - ${entity} already exists`,
            type: GeneralResponseDto,
        }),
        ApiResponse({ 
            status: HttpStatus.NOT_FOUND,
            description: 'Not Found - Related entity not found.',
            type: GeneralResponseDto
        }),
        ApiResponse({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            description: 'Unprocessable Entity - Validation failed',
            type: GeneralResponseDto,
        }),
    );
}

export function ApiUpdateResponses(entity: string, getDtoClass: any) {
    return applyDecorators(
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: 'Not Found - Resource not found',
            type: GeneralResponseDto,
        }),
        ApiResponse({ 
            status: HttpStatus.OK, 
            description: `${entity} has been successfully updated.`,
            type: getDtoClass
        }),
        ApiResponse({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            description: 'Unprocessable Entity - Validation failed',
            type: GeneralResponseDto,
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: `${entity} not found.`,
            type: GeneralResponseDto
        }),
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: 'Data conflict during update.',
            type: GeneralResponseDto
        })
    );
}