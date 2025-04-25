import { createController } from "@/common/factories/create-controller.factory";
import { BranchesService } from "./branches.service";
import { BranchDto, GetBranchDto, UpdateBranchDto } from "./dtos/branch.dto";
import { Branch } from "./entities/branch.entity";

export class BranchesController extends createController(Branch, BranchesService, GetBranchDto, BranchDto, UpdateBranchDto)
{

}