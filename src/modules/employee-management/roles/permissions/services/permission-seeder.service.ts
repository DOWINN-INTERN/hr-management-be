import { Action } from '@/common/enums/action.enum';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { glob } from 'glob';
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
      await this.seedPermissions();
    }
  }
  
  async seedPermissions(): Promise<void> {
    this.logger.log('🔍 Scanning controllers for permissions...');
    const permissions = await this.scanForPermissions();
    
    this.logger.log(`Found ${permissions.length} permissions in controllers`);
    
    let created = 0;
    let updated = 0;
    
    for (const permDef of permissions) {
      const result = await this.createOrUpdatePermission(permDef);
      if (result.isNew) created++;
      else updated++;
    }
    
    this.logger.log(`Permission seeding completed: ${created} created, ${updated} updated`);
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
  
  async scanForPermissions(): Promise<any[]> {
    const permissions = [];
    const controllers = await this.findControllerFiles();
    
    for (const file of controllers) {
      const fileContent = fs.readFileSync(file, 'utf8');
      
      // Find createPermissions calls
      const permissionsMatches = fileContent.match(/const\s+Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      
      if (permissionsMatches) {
        for (const permMatch of permissionsMatches) {
          // Extract resource name
          const resourceMatch = permMatch.match(/createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          if (resourceMatch && resourceMatch[1]) {
            const subject = resourceMatch[1];
            
            // Find all @Authorize decorators
            const authorizeRegex = /@Authorize\s*\(\s*\{[^}]*permissions\s*:\s*\[\s*([\s\S]*?)\s*\]/g;
            const authorizeMatches = [...fileContent.matchAll(authorizeRegex)];
            
            if (authorizeMatches.length) {
              for (const authMatch of authorizeMatches) {
                if (authMatch[1]) {
                  // Extract permission references
                  const permRefs = authMatch[1].split(',').map(p => p.trim());
                  
                  for (const permRef of permRefs) {
                    // Match Permissions.Action pattern
                    const actionMatch = permRef.match(/Permissions\.(\w+)/);
                    if (actionMatch && actionMatch[1]) {
                      const action = this.mapActionNameToEnum(actionMatch[1]);
                      
                      permissions.push({
                        action,
                        subject,
                        name: `${actionMatch[1]} ${subject}`,
                        description: `Permission to ${actionMatch[1].toLowerCase()} ${subject}`
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return this.removeDuplicates(permissions);
  }
  
  private async findControllerFiles(): Promise<string[]> {
    try {
      return await glob('src/**/*.controller.ts', { ignore: 'node_modules/**' });
    } catch (err) {
      throw err;
    }
  }
  
  private mapActionNameToEnum(actionName: string): Action {
    const map = {
      'Create': Action.CREATE,
      'Read': Action.READ,
      'Update': Action.UPDATE,
      'Delete': Action.DELETE,
      'Manage': Action.MANAGE
    };
    
    return map[actionName as keyof typeof map] || Action.READ;
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