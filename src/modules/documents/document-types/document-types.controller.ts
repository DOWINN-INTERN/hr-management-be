import { createController } from "@/common/factories/create-controller.factory";
import { DocumentTypesService } from "./document-types.service";
import { DocumentTypeDto, GetDocumentTypeDto, UpdateDocumentTypeDto } from "./dtos/document-type.dto";
import { DocumentType } from "./entities/document-type.entity";

export class DocumentTypesController extends createController(DocumentType, DocumentTypesService, GetDocumentTypeDto, DocumentTypeDto, UpdateDocumentTypeDto)
{

}