import { BaseDto } from "@/common/dtos/base.dto";
import { RoleScopeType } from "@/common/enums/role-scope-type.enum";
import { PartialType } from "@nestjs/swagger";

export class FileUploadOptions extends PartialType(BaseDto) {
    folder?: string;
    customFileName?: string;
    metadata?: Record<string, any>;
    public?: boolean;
    contentType?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
    token?: string;
    // Add multi-tenant context
    scope?: RoleScopeType;
}