import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { Body, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ManagementWorkTimeRequestDto } from "./dtos/management-work-time-request.dto";
import { GetWorkTimeRequestDto, UpdateWorkTimeRequestDto, WorkTimeRequestDto } from "./dtos/work-time-request.dto";
import { WorkTimeRequest } from "./entities/work-time-request.entity";
import { WorkTimeRequestsService } from "./work-time-requests.service";

export class WorkTimeRequestsController extends createController(WorkTimeRequest, WorkTimeRequestsService, GetWorkTimeRequestDto, WorkTimeRequestDto, UpdateWorkTimeRequestDto)
{
    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    @Post('management')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Create management-requested work time requests',
        description: 'Creates early arrival or overtime requests for one or more employees'
    })
    @ApiBody({ type: ManagementWorkTimeRequestDto, description: 'Management work time request', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'Management work time request created successfully', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request parameters' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Manager, employee(s), or schedule(s) not found' })
    async createManagementWorkRequest(
        @Body() dto: ManagementWorkTimeRequestDto,
        @CurrentUser('sub') managerId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const success = await this.baseService.createManagementWorkRequest(dto, managerId);
        return {
            message: 'Management work time request created successfully'
        };
    }
}