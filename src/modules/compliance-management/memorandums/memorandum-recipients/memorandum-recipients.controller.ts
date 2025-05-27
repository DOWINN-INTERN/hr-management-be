import { createController } from "@/common/factories/create-controller.factory";
import { MemorandumRecipientDto, GetMemorandumRecipientDto, UpdateMemorandumRecipientDto } from "./dtos/memorandum-recipient.dto";
import { MemorandumRecipientsService } from "./memorandum-recipients.service";
import { MemorandumRecipient } from "./entities/memorandum-recipient.entity";

export class MemorandumRecipientsController extends createController(
    MemorandumRecipient,       // Entity name for Swagger documentation
    MemorandumRecipientsService, // The service handling MemorandumRecipient-related operations
    GetMemorandumRecipientDto,  // DTO for retrieving MemorandumRecipients
    MemorandumRecipientDto,     // DTO for creating MemorandumRecipients
    UpdateMemorandumRecipientDto, // DTO for updating MemorandumRecipients
) {
}