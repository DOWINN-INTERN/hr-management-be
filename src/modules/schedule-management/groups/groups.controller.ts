import { createController } from "@/common/factories/create-controller.factory";
import { GroupDto, GetGroupDto, UpdateGroupDto } from "./dtos/group.dto";
import { GroupsService } from "./groups.service";
import { Group } from "./entities/group.entity";

export class GroupsController extends createController<
    Group,
    GetGroupDto,
    GroupDto,
    UpdateGroupDto
>(
    'Groups',       // Entity name for Swagger documentation
    GroupsService, // The service handling Group-related operations
    GetGroupDto,  // DTO for retrieving Groups
    GroupDto,     // DTO for creating Groups
    UpdateGroupDto, // DTO for updating Groups
) {
}