import { IRole } from "@/modules/employee-management/roles/interface/role.interface";

export interface IJwtPayload {
    sub: string;        // subject (usually user id)
    iat?: number;       // issued at
    exp?: number;       // expiration time
    iss?: string;       // issuer
    aud?: string;       // audience
    // ... any custom claims you need
    email?: string;
    employeeId?: string;
    departments?: string[];
    organizations?: string[];
    branches?: string[]; 
    roles?: IRole[];
    refreshToken?: string;
  }