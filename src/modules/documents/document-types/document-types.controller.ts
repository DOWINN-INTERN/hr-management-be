import { createController } from '@/common/factories/create-controller.factory';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypeDto, GetDocumentTypeDto, UpdateDocumentTypeDto } from './dtos/document-type.dto';
import { DocumentType } from './entities/document-type.entity';

export class DocumentTypesController extends createController<
    DocumentType,
    GetDocumentTypeDto,
    DocumentTypeDto,
    UpdateDocumentTypeDto
>(
    'Document Types', // Entity name for Swagger documentation
    DocumentTypesService, // The service handling DocumentType-related operations
    GetDocumentTypeDto, // DTO for retrieving DocumentTypes
    DocumentTypeDto, // DTO for creating DocumentTypes
    UpdateDocumentTypeDto, // DTO for updating DocumentTypes
) {}