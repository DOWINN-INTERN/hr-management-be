import * as fs from 'fs';
import * as path from 'path';
import { Action } from '../../../../../common/enums/action.enum';

export interface PermissionDefinition {
  action: Action;
  subject: string;
  name?: string;
  description?: string;
}

export class PermissionScanner {
  private permissions: PermissionDefinition[] = [];
  
  /**
   * Scan a directory recursively for controller files and extract permissions
   */
  async scanDirectoryForPermissions(directoryPath: string): Promise<PermissionDefinition[]> {
    await this.scanDirectory(directoryPath);
    return this.permissions;
  }
  
  private async scanDirectory(dirPath: string): Promise<void> {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        await this.scanDirectory(filePath);
      } else if (file.endsWith('.controller.ts') || file.includes('base.controller.ts')) {
        // Process controller files
        await this.extractPermissionsFromFile(filePath);
      }
    }
  }
  
  private async extractPermissionsFromFile(filePath: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract subject from createPermissions calls
    const subjectMap = new Map<string, string>();
    this.extractPermissionSubjects(fileContent, subjectMap);
    
    // Extract permissions from createPermissions and destructuring
    this.extractNamedPermissions(fileContent, subjectMap);
    
    // Extract permissions from @Authorize decorators
    this.extractAuthorizePermissions(fileContent, subjectMap);
  }
  
  private extractPermissionSubjects(fileContent: string, subjectMap: Map<string, string>): void {
    const permDefRegex = /export\s+const\s+(\w+)Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    
    while ((match = permDefRegex.exec(fileContent)) !== null) {
      const prefix = match[1]; // e.g., "Profile"
      const subject = match[2]; // e.g., "profiles"
      subjectMap.set(prefix, subject);
    }
  }
  
  private extractNamedPermissions(fileContent: string, subjectMap: Map<string, string>): void {
    // For each subject, find destructured permissions
    for (const [prefix, subject] of subjectMap.entries()) {
      const destructureRegex = new RegExp(`const\\s*{\\s*([^}]+)\\s*}\\s*=\\s*${prefix}Permissions`, 'g');
      let match;
      
      while ((match = destructureRegex.exec(fileContent)) !== null) {
        if (match[1]) {
          // Split and process each permission action
          const actionNames = match[1].split(',').map(a => a.trim());
          
          for (const actionName of actionNames) {
            const action = this.mapActionNameToEnum(actionName);
            
            this.permissions.push({
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
  
  private extractAuthorizePermissions(fileContent: string, subjectMap: Map<string, string>): void {
    // Find all @Authorize decorators with permission arrays
    const authorizeRegex = /@Authorize\s*\(\s*\{[^}]*permissions\s*:\s*\[([\s\S]*?)\]\s*\}/g;
    let match;
    
    while ((match = authorizeRegex.exec(fileContent)) !== null) {
      if (match[1]) {
        // Extract permission references
        const permRefs = match[1].split(',').map(p => p.trim());
        
        for (const permRef of permRefs) {
          // Handle both formats: direct reference and prefix.Action pattern
          if (permRef.includes('.')) {
            // Format: PrefixPermissions.Action (e.g., ProfilePermissions.Read)
            const parts = permRef.split('.');
            if (parts.length === 2) {
              // Find which subject this refers to
              for (const [prefix, subject] of subjectMap.entries()) {
                if (parts[0].includes(prefix)) {
                  const actionName = parts[1].trim();
                  const action = this.mapActionNameToEnum(actionName);
                  
                  this.permissions.push({
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
            // We need to determine the context - use nearby method/class context
            // This is a simplified approach - context is inferred from the file
            for (const subject of subjectMap.values()) {
              const action = this.mapActionNameToEnum(permRef);
              
              this.permissions.push({
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
}