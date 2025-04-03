import { createController } from '@/common/factories/create-controller.factory';
import { DocumentsService } from './documents.service';
import { DocumentDto, GetDocumentDto, UpdateDocumentDto } from './dtos/document.dto';
import { Document } from './entities/document.entity';

export class DocumentsController extends createController<
    Document,
    GetDocumentDto,
    DocumentDto,
    UpdateDocumentDto
>(
    'Documents',       // Entity name for Swagger documentation
    DocumentsService, // The service handling Document-related operations
    GetDocumentDto,  // DTO for retrieving Documents
    DocumentDto,     // DTO for creating Documents
    UpdateDocumentDto // DTO for updating Documents
) {
}
