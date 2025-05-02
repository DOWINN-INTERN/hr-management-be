import { SetMetadata } from '@nestjs/common';

export const RESOURCE_OWNERSHIP_KEY = 'resource_ownership_config';

export interface ResourceOwnershipConfig {
  ownerField: string;              // Direct ownership field (userId, ownerId)
  relationPath?: string[];         // Path to follow for relationship-based ownership
  includeInQuery?: boolean;        // Whether to automatically include in query filters
}

export const ResourceOwner = (config: ResourceOwnershipConfig) => 
  SetMetadata(RESOURCE_OWNERSHIP_KEY, config);