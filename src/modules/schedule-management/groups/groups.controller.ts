import { createController } from "@/common/factories/create-controller.factory";
import { GetGroupDto, GroupDto, UpdateGroupDto } from "./dtos/group.dto";
import { Group } from "./entities/group.entity";
import { GroupsService } from "./groups.service";

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