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
    
    // Find exported permission objects like "export const Profile = {...}"
    const permissionObjectRegex = /export\s+const\s+(\w+)\s*=\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = permissionObjectRegex.exec(fileContent)) !== null) {
      const objectName = match[1]; // e.g., "Profile"
      const objectContent = match[2]; // Content between the braces
      
      // Find individual permission definitions
      const permissionDefRegex = /(\w+):\s*{\s*action:\s*Action\.(\w+),\s*subject:\s*Subject\.(\w+)\s*}/g;
      let permMatch;
      
      while ((permMatch = permissionDefRegex.exec(objectContent)) !== null) {
        const permissionKey = permMatch[1]; // e.g., "Read", "Create"
        const action = permMatch[2];        // e.g., "READ", "CREATE"
        const subject = permMatch[3];       // e.g., "Profile"
        
        // Generate a proper name and description
        const permName = `${permissionKey} ${objectName}`;
        const description = `Permission to ${action.toLowerCase()} ${objectName.toLowerCase()}`;
        
        this.permissions.push({
          action: action as Action,
          subject: subject,
          name: permName,
          description: description
        });
      }
    }
  }
}