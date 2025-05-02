import { Injectable, Logger } from '@nestjs/common';
import { singular } from 'pluralize';
import { EntityManager } from 'typeorm';

@Injectable()
export class ResourceOwnershipService {
  private readonly logger = new Logger(ResourceOwnershipService.name);
  
  constructor(
    private readonly entityManager: EntityManager
  ) {}

  /**
   * Dynamically check if a user owns or has access to a resource
   */
  async isResourceOwner(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    try {
      // Convert plural resource names to singular (e.g., "users" -> "user")
      const entityName = singular(resourceType);
      
      // Get metadata for the entity to check its structure
      const metadata = this.entityManager.connection.getMetadata(entityName);
      if (!metadata) {
        this.logger.warn(`No entity metadata found for "${entityName}"`);
        return false;
      }
      
      // Look for common ownership columns
      const ownershipColumns = [
        'userId', 
        'ownerId',
        'createdBy', 
        'authorId',
        'employeeId'
      ];

      // Check if this entity has any ownership columns
      const ownershipColumn = metadata.columns.find(column => 
        ownershipColumns.includes(column.propertyName)
      )?.propertyName;
      
      if (!ownershipColumn) {
        this.logger.debug(`No ownership column found for entity "${entityName}"`);
        return false;
      }
      
      // Build a dynamic query to check ownership
      const query = `
        SELECT COUNT(*) as count 
        FROM ${metadata.tableName} 
        WHERE id = $1 AND ${ownershipColumn} = $2
      `;
      
      const result = await this.entityManager.query(query, [resourceId, userId]);
      const count = parseInt(result[0]?.count || '0', 10);
      
      return count > 0;
    } catch (error: any) {
      this.logger.error(
        `Error checking resource ownership (${resourceType}:${resourceId}): ${error.message}`,
        error.stack
      );
      return false;
    }
  }

  /**
   * Check ownership through relationship
   * For more complex cases where the ownership is through relationships
   */
  async isResourceOwnerThroughRelation(
    userId: string,
    resourceType: string,
    resourceId: string,
    relationPath: string[]
  ): Promise<boolean> {
    try {
      // Implementation for relationship-based ownership
      // This would join tables following the relation path
      // E.g., check if user is team member of a project's team
      
      // Sample implementation for a specific case could be:
      const entityName = singular(resourceType);
      const lastRelation = relationPath[relationPath.length - 1];
      
      // Build a more complex query with joins
      const query = `
        WITH resource_path AS (
          SELECT * FROM ${entityName}
          WHERE id = $1
        )
        SELECT COUNT(*) as count
        FROM resource_path r
        JOIN ${relationPath.join(' JOIN ')}
        WHERE ${lastRelation}.user_id = $2
      `;
      
      const result = await this.entityManager.query(query, [resourceId, userId]);
      return parseInt(result[0]?.count || '0', 10) > 0;
      
    } catch (error: any) {
      this.logger.error(
        `Error checking relationship ownership: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}