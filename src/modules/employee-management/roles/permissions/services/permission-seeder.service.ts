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
    const permissions: any[] = [];
    const controllers = await this.findControllerFiles();
    
    for (const file of controllers) {
      const fileContent = fs.readFileSync(file, 'utf8');
      
      // Find all permission definitions using various patterns
      this.extractNamedPermissions(fileContent, permissions);
      
      // Get all @Authorize decorator usages with their permission references
      this.extractAuthorizationRules(fileContent, permissions);
    }
    
    return this.removeDuplicates(permissions);
  }
  
  private extractNamedPermissions(fileContent: string, permissions: any[]): void {
    // Find both ProfilePermissions and other similar patterns
    const permissionDefRegex = /export\s+const\s+(\w+)Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let permMatch;
    
    while ((permMatch = permissionDefRegex.exec(fileContent)) !== null) {
      const prefix = permMatch[1]; // e.g., "Profile"
      const subject = permMatch[2]; // e.g., "profiles"
      
      // Extract destructured permission variables
      const destructureRegex = new RegExp(`const\\s*{\\s*([^}]+)\\s*}\\s*=\\s*${prefix}Permissions`, 'g');
      let destructureMatch;
      
      while ((destructureMatch = destructureRegex.exec(fileContent)) !== null) {
        if (destructureMatch[1]) {
          // Split and process each permission action
          const actionNames = destructureMatch[1].split(',').map(a => a.trim());
          
          for (const actionName of actionNames) {
            const action = this.mapActionNameToEnum(actionName);
            
            permissions.push({
              action,
              subject,
              name: `${actionName} ${subject}`,
              description: `Permission to ${actionName.toLowerCase()} ${subject}`
            });
          }
        }
      }
    }
  }
  
  private extractAuthorizationRules(fileContent: string, permissions: any[]): void {
    // First identify all subject names from createPermissions calls
    const subjectMap = new Map<string, string>();
    const permDefRegex = /export\s+const\s+(\w+)Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let permDefMatch;
    
    while ((permDefMatch = permDefRegex.exec(fileContent)) !== null) {
      const prefix = permDefMatch[1]; // e.g., "Profile"
      const subject = permDefMatch[2]; // e.g., "profiles"
      subjectMap.set(prefix, subject);
    }
    
    // Find all @Authorize decorators with permission arrays
    const authorizeRegex = /@Authorize\s*\(\s*\{[^}]*permissions\s*:\s*\[([\s\S]*?)\]\s*\}/g;
    let authorizeMatch;
    
    while ((authorizeMatch = authorizeRegex.exec(fileContent)) !== null) {
      if (authorizeMatch[1]) {
        // Extract permission references
        const permRefs = authorizeMatch[1].split(',').map(p => p.trim());
        
        for (const permRef of permRefs) {
          // Handle both formats: direct reference and prefix.Action pattern
          if (permRef.includes('.')) {
            // Format: PrefixPermissions.Action (e.g., ProfilePermissions.Read)
            const parts = permRef.split('.');
            if (parts.length === 2) {
              // Get subject from the map if available
              for (const [prefix, subject] of subjectMap.entries()) {
                if (permRef.startsWith(prefix)) {
                  const actionName = parts[1].trim();
                  const action = this.mapActionNameToEnum(actionName);
                  
                  permissions.push({
                    action,
                    subject,
                    name: `${actionName} ${subject}`,
                    description: `Permission to ${actionName.toLowerCase()} ${subject}`
                  });
                }
              }
            }
          } else {
            // Direct reference (e.g., Read, Manage)
            // Find the subject from context (in this case we need to infer it from the file)
            for (const subject of subjectMap.values()) {
              const action = this.mapActionNameToEnum(permRef);
              
              permissions.push({
                action,
                subject,
                name: `${permRef} ${subject}`,
                description: `Permission to ${permRef.toLowerCase()} ${subject}`
              });
            }
          }
        }
      }
    }
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