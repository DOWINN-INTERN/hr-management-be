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
    noop,
    template,
    url
} from '@angular-devkit/schematics';
import { Schema } from './schema';

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
      const entityPath = `${basePath}/entities`;
      const dtoPath = `${basePath}/dtos`;
      
      if (!tree.exists(entityPath)) {
        tree.create(entityPath + '/.gitkeep', '');
      }
      
      if (!tree.exists(dtoPath)) {
        tree.create(dtoPath + '/.gitkeep', '');
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
          
          // Entity files go to entities folder
          if (fileName.endsWith('.entity.ts')) {
            return {
              content: fileEntry.content,
              path: normalize(`entities/${options.entityName}.entity.ts`)
            };
          }
          
          // DTO files go to dtos folder 
          if (fileName.endsWith('.dto.ts')) {
            return {
              content: fileEntry.content,
              path: normalize(`dtos/${options.entityName}.dto.ts`)
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
      
      // Choose which module to update based on path
        const isTopLevelModule = !options.name.includes('/');
  
        const updateModule = (options.updateParentModule === false) 
        ? noop() 
        : isTopLevelModule 
          ? (tree: Tree) => updateAppModule(tree, options)
          : (tree: Tree) => updateModuleFile(tree, options);
    
      return chain([
        branchAndMerge(mergeWith(templateSource)),
        updateModule,
      ]);
    };
  }

  /**
 * Add the new module to AppModule
 */
function updateAppModule(tree: Tree, options: Schema): Rule {
    return (tree: Tree) => {
      const appModulePath = 'src/app.module.ts';
      
      if (!tree.exists(appModulePath)) {
        return tree;
      }
      
      // Read the app module file
      let appModuleContent = tree.read(appModulePath)?.toString('utf-8');
      if (!appModuleContent) {
        return tree;
      }
      
      // Create module name
      const currentModule = options.moduleName;
      const moduleName = strings.classify(`${currentModule}Module`);
      const importPath = `./modules/${strings.dasherize(options.name)}/${strings.dasherize(currentModule)}.module`;
      
      // Add import statement if not already present
      if (!appModuleContent.includes(`import { ${moduleName} } from '${importPath}'`)) {
        // Find last import line
        const lastImportIndex = appModuleContent.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = appModuleContent.indexOf('\n', lastImportIndex);
          if (endOfLine !== -1) {
            appModuleContent = appModuleContent.substring(0, endOfLine + 1) + 
                             `import { ${moduleName} } from '${importPath}';\n` + 
                             appModuleContent.substring(endOfLine + 1);
          }
        }
      }
      
      // Add module to imports array with consistent formatting
      appModuleContent = appModuleContent.replace(
        /imports\s*:\s*\[([\s\S]*?)\],/,
        (match, importContents) => {
          // Extract all current imports
          const importItems = importContents
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
          
          // Add new module if not already present
          if (!importItems.includes(moduleName)) {
            importItems.push(moduleName);
          }
          
          // Rebuild with consistent formatting
          const formattedImports = importItems
            .map(item => `    ${item}`)
            .join(',\n');
          
          return `imports: [\n${formattedImports},\n  ],`;
        }
      );
      
      // Fix duplicate imports
      appModuleContent = dedupImports(appModuleContent);
      
      // Write modified content back to file
      tree.overwrite(appModulePath, appModuleContent);
      
      return tree;
    };
  }

/**
 * Find the parent module and update its imports
 */
function updateModuleFile(tree: Tree, options: Schema): Rule {
    return (tree: Tree) => {
      if (!options.name.includes('/')) {
        // No parent module to update if not nested
        return tree;
      }
  
      // Get the correct parent path
      const segments = options.name.split('/');
      segments.pop(); // Remove the current module name
      
      // Parent module path
      const parentPath = `src/modules/${segments.join('/')}`;
      const parentModuleName = segments[segments.length - 1]; // Last remaining segment
      const parentModulePath = `${parentPath}/${parentModuleName}.module.ts`;
  
      if (!tree.exists(parentModulePath)) {
        // Parent module doesn't exist
        return tree;
      }
  
      // Get current module name
      const currentModule = options.name.split('/').pop() || '';
      // Module name for import
      const moduleName = strings.classify(`${currentModule}Module`);
      // Module path for import
      const modulePath = `./${strings.dasherize(currentModule)}/${strings.dasherize(currentModule)}.module`;
  
      // Read and parse module file as text (easier than AST manipulation)
      let moduleContent = tree.read(parentModulePath)?.toString('utf-8');
      if (!moduleContent) {
        return tree;
      }
  
      // Add import statement if not already present
      if (!moduleContent.includes(`import { ${moduleName} } from '${modulePath}'`)) {
        // Find last import line
        const lastImportIndex = moduleContent.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = moduleContent.indexOf('\n', lastImportIndex);
          if (endOfLine !== -1) {
            moduleContent = moduleContent.substring(0, endOfLine + 1) + 
                           `import { ${moduleName} } from '${modulePath}';\n` + 
                           moduleContent.substring(endOfLine + 1);
          }
        }
      }
  
      // Add module to imports array with consistent formatting
moduleContent = moduleContent.replace(
    /imports\s*:\s*\[([\s\S]*?)\],/,
    (match, importContents) => {
      // Extract all current imports
      const importItems = importContents
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      // Add new module if not already present
      if (!importItems.includes(moduleName)) {
        importItems.push(moduleName);
      }
      
      // Rebuild with consistent formatting
      const formattedImports = importItems
        .map(item => `        ${item}`)
        .join(',\n');
      
      return `imports: [\n${formattedImports},\n    ],`;
    }
  );
  
  // Same approach for exports
  moduleContent = moduleContent.replace(
    /exports\s*:\s*\[([\s\S]*?)\],/,
    (match, exportContents) => {
      // Extract all current exports
      const exportItems = exportContents
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      // Add new module if not already present
      if (!exportItems.includes(moduleName)) {
        exportItems.push(moduleName);
      }
      
      // Rebuild with consistent formatting
      const formattedExports = exportItems
        .map(item => `        ${item}`)
        .join(',\n');
      
      return `exports: [\n${formattedExports},\n    ],`;
    }
  );
  
      // Fix duplicate imports
      moduleContent = dedupImports(moduleContent);

        // Replace the addToRouterModuleChildren call with reconstructRouterModule
        moduleContent = reconstructRouterModule(
            moduleContent, 
            segments, 
            currentModule, 
            moduleName
        );
  
      // Write modified content back to file
      tree.overwrite(parentModulePath, moduleContent);
      
      return tree;
    };
  }
  
  /**
   * Remove duplicate import statements
   */
  function dedupImports(content: string): string {
    const lines = content.split('\n');
    const imports = new Map<string, string>();
    
    // Collect unique imports
    for (const line of lines) {
      if (line.trim().startsWith('import ')) {
        const match = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const [, symbols, path] = match;
          const key = path.trim();
          if (imports.has(key)) {
            // Merge imports from the same path
            const existingSymbols = imports.get(key) || '';
            const newSymbols = [...new Set([...existingSymbols.split(','), ...symbols.split(',')])]
              .map(s => s.trim())
              .filter(Boolean)
              .join(', ');
            imports.set(key, newSymbols);
          } else {
            imports.set(key, symbols.trim());
          }
        } else {
          // Keep non-matching import lines
          imports.set(line, '');
        }
      }
    }
    
    // Rebuild content with deduplicated imports
    const importLines: string[] = [];
    for (const [key, value] of imports.entries()) {
      if (value === '') {
        // This is a full line that didn't match our regex
        importLines.push(key);
      } else {
        importLines.push(`import { ${value} } from '${key}';`);
      }
    }
    
    // Replace all imports with deduplicated ones
    const importsSection = importLines.join('\n');
    const afterImports = content.substring(content.lastIndexOf('import ') + 'import '.length);
    const afterLastImport = afterImports.substring(afterImports.indexOf(';') + 1);
    
    return importsSection + afterLastImport;
  }

/**
 * Completely reconstruct the RouterModule section with proper formatting
 */
function reconstructRouterModule(content: string, pathSegments: string[], currentModule: string, moduleName: string): string {
    // If no RouterModule, return unchanged
    if (!content.includes('RouterModule.register')) {
      return content;
    }
  
    // Extract the entire RouterModule.register section
    const routerRegex = /RouterModule\.register\(\[([\s\S]*?)\]\),/;
    const routerMatch = content.match(routerRegex);
    
    if (!routerMatch) {
      return content;
    }
    
    // Extract routes from existing configuration
    const existingConfig = routerMatch[1];
    const routes = parseRoutes(existingConfig);
    
    // Add the new route to the appropriate parent
    const updatedRoutes = addRouteToParent(routes, pathSegments, currentModule, moduleName);
    
    // Format the updated routes into a properly indented string
    const formattedRoutes = formatRoutes(updatedRoutes);
    
    // Replace the original RouterModule section
    return content.replace(
      routerMatch[0],
      `RouterModule.register([\n${formattedRoutes}\n        ]),`
    );
  }
  
  /**
   * Parse route objects from RouterModule configuration
   */
  function parseRoutes(routerConfig: string): any[] {
    const routes = [];
    let currentRoute = null;
    let bracketCount = 0;
    let buffer = '';
    
    // Simple state machine to parse routes
    for (let i = 0; i < routerConfig.length; i++) {
      const char = routerConfig[i];
      
      if (char === '{') {
        bracketCount++;
        if (bracketCount === 1) {
          // Start of a new route
          currentRoute = {};
          buffer = '{';
        } else {
          buffer += char;
        }
      } else if (char === '}') {
        bracketCount--;
        buffer += char;
        
        if (bracketCount === 0) {
          // End of route, parse it
          try {
            // Extract key properties using regex
            const pathMatch = buffer.match(/path:\s*['"]([^'"]+)['"]/);
            const moduleMatch = buffer.match(/module:\s*([^,\s\n]+)/);
            const childrenMatch = buffer.match(/children:\s*\[([\s\S]*?)\]/);
            
            if (pathMatch && moduleMatch) {
              currentRoute.path = pathMatch[1];
              currentRoute.module = moduleMatch[1];
              
              if (childrenMatch) {
                // Recursively parse children
                currentRoute.children = parseRoutes(childrenMatch[1]);
              }
              
              routes.push(currentRoute);
            }
          } catch (e) {
            // If parsing fails, just add the raw string
            console.error('Error parsing route:', e);
          }
          
          buffer = '';
        }
      } else {
        buffer += char;
      }
    }
    
    return routes;
  }
  
/**
 * Add a new route to the appropriate parent based on path segments
 */
function addRouteToParent(routes: any[], pathSegments: string[], currentModule: string, moduleName: string): any[] {
    // Clone routes to avoid modifying the original
    const result = JSON.parse(JSON.stringify(routes));
    
    // Handle first level nesting - simpler case
    if (pathSegments.length === 1) {
      const parentPath = strings.dasherize(pathSegments[0]);
      const parentIndex = result.findIndex(r => r.path === parentPath);
      
      if (parentIndex >= 0) {
        // Parent found, add child
        const parent = result[parentIndex];
        
        // Initialize children array if needed
        if (!parent.children) {
          parent.children = [];
        }
        
        // Check if child already exists
        const childExists = parent.children.some(c => c.path === strings.dasherize(currentModule));
        
        if (!childExists) {
          // Add new child to parent
          parent.children.push({
            path: strings.dasherize(currentModule),
            module: moduleName
          });
        }
      }
      
      return result;
    }
    
    // Handle deeply nested modules like schedules/groups/shifts
    
    // Start by finding the top-level parent
    const topLevelPath = strings.dasherize(pathSegments[0]);
    const topLevelIndex = result.findIndex(r => r.path === topLevelPath);
    
    // If top-level parent not found, return unchanged
    if (topLevelIndex === -1) {
      return result;
    }
    
    // Navigate through the hierarchy to find the immediate parent
    let currentParent = result[topLevelIndex];
    
    // For each segment except the first (which is the parent we start with)
    // and the last (which is the module we're adding)
    for (let i = 1; i < pathSegments.length; i++) {
      const segmentPath = strings.dasherize(pathSegments[i]);
      
      // Initialize children array if needed
      if (!currentParent.children) {
        currentParent.children = [];
      }
      
      // Try to find this segment in current parent's children
      let found = false;
      for (let j = 0; j < currentParent.children.length; j++) {
        if (currentParent.children[j].path === segmentPath) {
          // Found the child, move down the hierarchy
          currentParent = currentParent.children[j];
          found = true;
          break;
        }
      }
      
      // If this segment doesn't exist, create it
      if (!found) {
        // Create module name for this segment
        const segmentModuleName = strings.classify(`${pathSegments[i]}Module`);
        
        // Add new child route
        const newRoute = {
          path: segmentPath,
          module: segmentModuleName,
          children: []
        };
        
        currentParent.children.push(newRoute);
        currentParent = newRoute;
      }
    }
    
    // At this point, currentParent is the immediate parent of our new module
    
    // Initialize children array if needed
    if (!currentParent.children) {
      currentParent.children = [];
    }
    
    // Check if child already exists
    const childExists = currentParent.children.some(c => c.path === strings.dasherize(currentModule));
    
    // Add the new module as a child of the immediate parent
    if (!childExists) {
      currentParent.children.push({
        path: strings.dasherize(currentModule),
        module: moduleName
      });
    }
    
    return result;
  }
  
  /**
 * Format routes into a properly indented string
 */
function formatRoutes(routes: any[], indent = 12): string {
    return routes.map(route => {
      const spaces = ' '.repeat(indent);
      let result = `${spaces}{
  ${spaces}    path: '${route.path}',
  ${spaces}    module: ${route.module}`;
      
      if (route.children && route.children.length > 0) {
        result += `,
  ${spaces}    children: [
  ${formatRoutes(route.children, indent + 4)}
  ${spaces}    ]`;
      }
      
      result += `
  ${spaces}}`;
      
      return result;
    }).join(',\n');
  }