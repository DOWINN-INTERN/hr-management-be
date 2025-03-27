import { RoleScopeType } from "@/common/enums/role-scope-type.enum";

export interface IRole {
    name: string;
    scope: RoleScopeType;
}