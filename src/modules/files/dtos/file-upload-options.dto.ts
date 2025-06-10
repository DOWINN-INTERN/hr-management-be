import { RoleScopeType } from "@/common/enums/role-scope-type.enum";

export class FileUploadOptions {
    folder?: string;
    customFileName?: string;
    metadata?: Record<string, any>;
    public?: boolean;
    contentType?: string;
    maxSizeBytes?: number;
    allowedTypes?: string[];
    token?: string;
    // Add multi-tenant context
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
    userId?: string;
    scope?: RoleScopeType;
}