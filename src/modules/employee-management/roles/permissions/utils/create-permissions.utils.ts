import { Action } from "@/common/enums/action.enum";

/**
 * Creates standard CRUD permission objects for a given subject
 * @param subject The entity/resource to create permissions for
 * @returns Object with standard CRUD permissions plus Manage
 */
export const createPermissions = <T extends string>(subject: T) => {
  return {
    Read: { action: Action.READ, subject },
    Create: { action: Action.CREATE, subject },
    Update: { action: Action.UPDATE, subject },
    Delete: { action: Action.DELETE, subject },
    Manage: { action: Action.MANAGE, subject },
  } as const;
};