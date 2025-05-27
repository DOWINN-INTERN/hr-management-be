import { createController } from "@/common/factories/create-controller.factory";
import { RuleDto, GetRuleDto, UpdateRuleDto } from "./dtos/rule.dto";
import { RulesService } from "./rules.service";
import { Rule } from "./entities/rule.entity";

export class RulesController extends createController(
    Rule,       // Entity name for Swagger documentation
    RulesService, // The service handling Rule-related operations
    GetRuleDto,  // DTO for retrieving Rules
    RuleDto,     // DTO for creating Rules
    UpdateRuleDto, // DTO for updating Rules
) {
}