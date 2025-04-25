import { createController } from '@/common/factories/create-controller.factory';
import { DocumentsService } from './documents.service';
import { DocumentDto, GetDocumentDto, UpdateDocumentDto } from './dtos/document.dto';
import { Document } from './entities/document.entity';

export class DocumentsController extends createController(Document, DocumentsService, GetDocumentDto, DocumentDto, UpdateDocumentDto)
{

}
