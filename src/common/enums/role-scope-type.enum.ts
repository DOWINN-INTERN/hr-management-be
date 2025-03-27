export enum RoleScopeType {
    GLOBAL = 'global',       // Can access everything
    ORGANIZATION = 'organization', // Limited to organization
    BRANCH = 'branch',       // Limited to branch
    DEPARTMENT = 'department', // Limited to department
    OWNED = 'owned',         // Limited to own resources
}