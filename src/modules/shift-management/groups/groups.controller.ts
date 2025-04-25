import { createController } from "@/common/factories/create-controller.factory";
import { GetGroupDto, GroupDto, UpdateGroupDto } from "./dtos/group.dto";
import { Group } from "./entities/group.entity";
import { GroupsService } from "./groups.service";

export class GroupsController extends createController(Group, GroupsService, GetGroupDto, GroupDto, UpdateGroupDto)
{

}