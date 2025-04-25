"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function main(options) {
    return (tree, _context) => {
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
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            // Process template variables
            (0, schematics_1.template)(Object.assign(Object.assign({}, core_1.strings), options)),
            // Critical fix: Handle file paths properly
            (0, schematics_1.forEach)((fileEntry) => {
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
                        path: (0, core_1.normalize)(`gateways/${options.entityName}.gateway.ts`)
                    };
                }
                // All other files use the moduleName
                return {
                    content: fileEntry.content,
                    path: (0, core_1.normalize)(fileName.replace('__name@dasherize__', moduleName))
                };
            }),
            // Move everything to the target path
            (0, schematics_1.move)((0, core_1.normalize)(basePath))
        ]);
        return (0, schematics_1.chain)([
            (0, schematics_1.branchAndMerge)((0, schematics_1.mergeWith)(templateSource)),
        ]);
    };
}
//# sourceMappingURL=index.js.map