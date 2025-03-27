import { SetMetadata } from '@nestjs/common';
import { IPermission } from '../interfaces/permission.interface';

export const DEPARTMENTS_KEY = 'departments';
export const BRANCHES_KEY = 'branches';
export const ORGANIZATIONS_KEY = 'organizations';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export interface AccessOptions {
  departments?: string[];
  branches?: string[];
  organizations?: string[];
  roles?: string[];
  permissions?: IPermission[];
}

/**
 * A decorator to set metadata for ERP access control including departments, branches, 
 * organizations, roles, and permissions.
 *
 * @param options - An object containing optional arrays for departments, branches, organizations, roles, and permissions.
 * @returns A decorator function that sets the metadata for the provided options.
 *
 * @example
 * ```typescript
 * @ERPAccess({
 *   departments: ['HR', 'Finance'],
 *   branches: ['branch1', 'branch2'],
 *   organizations: ['org1', 'org2'],
 *   roles: ['admin', 'user'],
 *   permissions: [{ name: 'read', level: 'admin' }]
 * })
 * class SomeClass {
 *  // class implementation
 * }
 * ```
 */
export const Access = (options: AccessOptions = {}) => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (options.departments && key !== undefined && descriptor !== undefined) {
      SetMetadata(DEPARTMENTS_KEY, options.departments)(target, key, descriptor);
    }
    if (options.branches && key !== undefined && descriptor !== undefined) {
      SetMetadata(BRANCHES_KEY, options.branches)(target, key, descriptor);
    }
    if (options.organizations && key !== undefined && descriptor !== undefined) {
      SetMetadata(ORGANIZATIONS_KEY, options.organizations)(target, key, descriptor);
    }
    if (options.roles && key !== undefined && descriptor !== undefined) {
      SetMetadata(ROLES_KEY, options.roles)(target, key, descriptor);
    }
    if (options.permissions && key !== undefined && descriptor !== undefined) {
      SetMetadata(PERMISSIONS_KEY, options.permissions)(target, key, descriptor);
    }
  };
};