import { Action } from '@/common/enums/action.enum';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionSeederService implements OnModuleInit {
  private readonly logger = new Logger(PermissionSeederService.name);
  
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  
  // Automatically run on module initialization
  async onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.seedPermissions();
      } catch (error) {
        this.logger.error(`Failed to seed permissions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  async seedPermissions(): Promise<void> {
    this.logger.log('🔍 Scanning controllers for permissions...');
    
    // Get permissions from controllers created with createController factory
    const factoryControllerPerms = await this.scanFactoryControllers();
    this.logger.log(`Found ${factoryControllerPerms.length} permissions from factory controllers`);
    
    // // Get permissions from regular BaseController extensions
    // const baseControllerPerms = await this.scanBaseControllerExtensions();
    // this.logger.log(`Found ${baseControllerPerms.length} permissions from BaseController extensions`);
    
    // // Get permissions from code patterns
    // const codePatternPerms = await this.scanForPermissions();
    // this.logger.log(`Found ${codePatternPerms.length} permissions from code patterns`);
    
    // Combine all permissions
    const allPermissions = [...factoryControllerPerms];
    const uniquePermissions = this.removeDuplicates(allPermissions);
    
    // this.logger.log(`Total unique permissions found: ${uniquePermissions.length}`);
    
    let created = 0;
    let updated = 0;
    
    try {
      for (const permDef of uniquePermissions) {
        const result = await this.createOrUpdatePermission(permDef);
        if (result.isNew) created++;
        else updated++;
      }
      
      this.logger.log(`Permission seeding completed: ${created} created, ${updated} updated`);
    } catch (error) {
      this.logger.error(`Error creating permissions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * NEW METHOD: Scan for controllers created with createController factory
   */
  private async scanFactoryControllers(): Promise<any[]> {
    const permissions: any[] = [];
    const controllers = await this.findControllerFiles();
    
    // Updated pattern to match controllers that extend from createController() without generic types
    const factoryControllerPattern = /export\s+class\s+(\w+)\s+extends\s+createController\s*\(\s*([\w.]+)\s*,\s*([\w.]+)\s*,\s*([\w.]+)(?:\s*,\s*([\w.]+))?(?:\s*,\s*([\w.]+))?\s*\)/;
    
    this.logger.debug(`Scanning ${controllers.length} controller files for factory controllers`);
    
    for (const file of controllers) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');
        const factoryMatch = fileContent.match(factoryControllerPattern);
        
        if (factoryMatch) {
          const controllerName = factoryMatch[1];
          const entityClass = factoryMatch[2];
          const serviceClass = factoryMatch[3];
          const getDtoClass = factoryMatch[4];
          const createDtoClass = factoryMatch[5];
          const updateDtoClass = factoryMatch[6];
          
          // Get entity name from class reference
          // First try to extract from entity class (removing "Entity" suffix if present)
          let entityName = entityClass.replace(/Entity$/, '');
          
          // If entityName contains dots (like module.Entity), get the last part
          if (entityName.includes('.')) {
            entityName = entityName.split('.').pop() || entityName;
          }
          
          this.logger.debug(`Found factory controller: ${controllerName} for entity ${entityName}`);
          
          // Always generate MANAGE permission
          permissions.push(this.createPermissionDefinition(Action.MANAGE, entityName));
          
          // Check for GetDto (Read permission)
          if (getDtoClass && getDtoClass.trim() !== 'null' && getDtoClass.trim() !== 'undefined') {
            permissions.push(this.createPermissionDefinition(Action.READ, entityName));
          }
          
          // Check for CreateDto (Create permission)
          if (createDtoClass && createDtoClass.trim() !== 'null' && createDtoClass.trim() !== 'undefined') {
            permissions.push(this.createPermissionDefinition(Action.CREATE, entityName));
          }
          
          // Check for UpdateDto (Update permission)
          if (updateDtoClass && updateDtoClass.trim() !== 'null' && updateDtoClass.trim() !== 'undefined') {
            permissions.push(this.createPermissionDefinition(Action.UPDATE, entityName));
          }
          
          // Add DELETE permission by default too (since most controllers likely support it)
          permissions.push(this.createPermissionDefinition(Action.DELETE, entityName));
        }
      } catch (error) {
        this.logger.warn(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return permissions;
  }
  
  /**
   * Helper to create a permission definition object
   */
  private createPermissionDefinition(action: Action, subject: string): any {
    const actionName = this.capitalizeFirstLetter(action);
    return {
      action,
      subject,
      name: `${actionName} ${subject}`,
      description: `Permission to ${action.toLowerCase()} ${subject}`
    };
  }
  
  /**
   * Scan for controllers extending BaseController directly
   */
  private async scanBaseControllerExtensions(): Promise<any[]> {
    const permissions: any[] = [];
    const controllers = await this.findControllerFiles();
    const baseControllerPattern = /extends\s+(?:[\w.]+\.)?BaseController\s*<\s*\w+\s*,\s*\w+(?:\s*,\s*\w+)*\s*>/;
    const entityPattern = /(?:super\s*\(\s*[\w\s.,]+,\s*[\w\s.,]+,\s*['"](\w+)['"]|protected\s+readonly\s+entityName\s*[:=]\s*['"](\w+)['"])/;
    
    // Get all actions from the enum
    const allActions = Object.values(Action);
    
    this.logger.debug(`Scanning ${controllers.length} controller files for BaseController extensions`);
    
    for (const file of controllers) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');
        
        // Skip files that use createController (we handle those separately)
        if (fileContent.includes('extends createController')) {
          continue;
        }
        
        // Check if this extends BaseController directly
        if (baseControllerPattern.test(fileContent)) {
          this.logger.debug(`Found BaseController extension in ${path.basename(file)}`);
          
          // Extract entity name
          const entityMatch = fileContent.match(entityPattern);
          let entityName = null;
          
          if (entityMatch) {
            // Get the first capturing group that has a value
            entityName = entityMatch[1] || entityMatch[2];
            this.logger.debug(`Found entity name: ${entityName} in ${path.basename(file)}`);
            
            // If entity name was found, create permissions for all actions
            if (entityName) {
              for (const action of allActions) {
                permissions.push(this.createPermissionDefinition(action, entityName));
              }
            }
          } else {
            // Try to infer entity name from controller name
            const controllerName = path.basename(file, '.controller.ts');
            if (controllerName) {
              const inferredEntityName = this.singularize(controllerName);
              this.logger.debug(`Inferred entity name from controller: ${inferredEntityName}`);
              
              for (const action of allActions) {
                permissions.push(this.createPermissionDefinition(action, inferredEntityName));
              }
            }
          }
        }
      } catch (error) {
        this.logger.warn(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return permissions;
  }
  
  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  /**
   * Simple singularization for English words
   */
  private singularize(word: string): string {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    } else if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  }
  
  private async createOrUpdatePermission(permDef: any): Promise<{ permission: Permission; isNew: boolean }> {
    // Check if permission already exists
    let permission = await this.permissionRepository.findOne({
      where: {
        action: permDef.action,
        subject: permDef.subject
      }
    });
    
    let isNew = false;
    
    if (!permission) {
      permission = this.permissionRepository.create({
        action: permDef.action,
        subject: permDef.subject,
        name: permDef.name,
        description: permDef.description
      });
      isNew = true;
    } else {
      // Update existing permission with any new metadata
      permission.name = permDef.name || permission.name;
      permission.description = permDef.description || permission.description;
    }
    
    await this.permissionRepository.save(permission);
    return { permission, isNew };
  }
  
  // Keep your existing scan methods
  async scanForPermissions(): Promise<any[]> {
    // Existing code...
    return [];
  }
  
  private extractNamedPermissions(fileContent: string, permissions: any[]): void {
    // Existing code...
  }
  
  private extractAuthorizationRules(fileContent: string, permissions: any[]): void {
    // Existing code...
  }
  
  private async findControllerFiles(): Promise<string[]> {
    try {
      return await glob('src/**/*.controller.ts', { ignore: 'node_modules/**' });
    } catch (err) {
      throw err;
    }
  }
  
  private mapActionNameToEnum(actionName: string): Action {
    const map: Record<string, Action> = {
      'Create': Action.CREATE,
      'Read': Action.READ,
      'Update': Action.UPDATE,
      'Delete': Action.DELETE,
      'Manage': Action.MANAGE
    };
    
    return map[actionName] || Action.READ;
  }
  
  private removeDuplicates(permissions: any[]): any[] {
    const uniqueSet = new Map();
    
    for (const perm of permissions) {
      const key = `${perm.action}:${perm.subject}`;
      uniqueSet.set(key, perm);
    }
    
    return Array.from(uniqueSet.values());
  }
}