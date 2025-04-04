import { createController } from "@/common/factories/create-controller.factory";
import { <%= classify(entityName) %>Dto, Get<%= classify(entityName) %>Dto, Update<%= classify(entityName) %>Dto } from "./dtos/<%= dasherize(entityName) %>.dto";
import { <%= classify(moduleName) %>Service } from "./<%= dasherize(moduleName) %>.service";
import { <%= classify(entityName) %> } from "./entities/<%= dasherize(entityName) %>.entity";

export class <%= classify(moduleName) %>Controller extends createController<
    <%= classify(entityName) %>,
    Get<%= classify(entityName) %>Dto,
    <%= classify(entityName) %>Dto,
    Update<%= classify(entityName) %>Dto
>(
    '<%= classify(entityName) %>s',       // Entity name for Swagger documentation
    <%= classify(moduleName) %>Service, // The service handling <%= classify(entityName) %>-related operations
    Get<%= classify(entityName) %>Dto,  // DTO for retrieving <%= classify(entityName) %>s
    <%= classify(entityName) %>Dto,     // DTO for creating <%= classify(entityName) %>s
    Update<%= classify(entityName) %>Dto, // DTO for updating <%= classify(entityName) %>s
) {
}