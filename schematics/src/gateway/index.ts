import { normalize, strings } from '@angular-devkit/core';
import {
    Rule,
    SchematicContext,
    Tree,
    apply,
    branchAndMerge,
    chain,
    forEach,
    mergeWith,
    move,
    template,
    url
} from '@angular-devkit/schematics';
import { Schema } from 'src/schema';

export function main(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
      // Parse the path segments
      const segments = options.name.split('/');
      const moduleName = segments[segments.length - 1]; // Last segment is the module name
      
      // If entity name isn't provided, derive it from the module name
      if (!options.entityName) {
        options.entityName = moduleName.endsWith('s') 
          ? moduleName.slice(0, -1) 
          : moduleName;
      }
      
      // Add necessary options for templates
      options.moduleName = moduleName;
      
      // Base path for output
      const basePath = options.path || `src/modules/${options.name}`;
      
      // Create directory structure
      const gatewayPath = `${basePath}/gateways`;

      if (!tree.exists(gatewayPath)) {
        tree.create(gatewayPath + '/.gitkeep', '');
      }
  
      // Apply templates and manipulate paths
      const templateSource = apply(url('./files'), [
        // Process template variables
        template({
          ...strings,
          ...options,
        }),
        
        // Critical fix: Handle file paths properly
        forEach((fileEntry) => {
            // Add right after your forEach
            console.log("Generated path:", fileEntry.path);
            // Get just the filename, not the full path
            const fullPath = fileEntry.path;
            const pathParts = fullPath.split('/');
            const fileName = pathParts[pathParts.length - 1];

            // Gateway files go to gateways folder
            if (fileName.endsWith('.gateway.ts')) {
                return {
                content: fileEntry.content,
                path: normalize(`gateways/${options.entityName}.gateway.ts`)
                };
            }
            
            // All other files use the moduleName
            return {
                content: fileEntry.content,
                path: normalize(fileName.replace('__name@dasherize__', moduleName))
            };
        }),
        
        // Move everything to the target path
        move(normalize(basePath))
      ]);
      
      return chain([
        branchAndMerge(mergeWith(templateSource)),
      ]);
    };
  }