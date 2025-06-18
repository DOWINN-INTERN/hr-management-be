import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ApiGenericResponses } from "@/common/decorators/generic-api-responses.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { UtilityHelper } from "@/common/helpers/utility.helper";
import { Body, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ScheduleGenerationDto } from "./dtos/schedule-generation.dto";
import { GetScheduleDto, ScheduleDto, UpdateScheduleDto } from "./dtos/schedule.dto";
import { Schedule } from "./entities/schedule.entity";
import { SchedulesService } from "./schedules.service";

export class SchedulesController extends createController(
    Schedule, 
    SchedulesService, 
    GetScheduleDto, 
    ScheduleDto, 
    UpdateScheduleDto
) {
    override async create(entityDto: ScheduleDto, createdById: string): Promise<GetScheduleDto> {
        return super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: ScheduleDto, updatedById: string): Promise<GetScheduleDto> {
        return super.update(id, entityDto, updatedById);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetScheduleDto> {
        return super.findOne(fieldsString, relations, select);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return super.softDelete(id, deletedBy);
    }

    @Post('generate')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Generate schedules for employees',
        description: 'Generates schedules for specified employees based on the provided criteria, including employee IDs and cutoff ID.'
    })
    @ApiBody({
        type: ScheduleGenerationDto,
        required: true,
        description: 'The criteria for generating schedules, including employee IDs, and cutoff ID.'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Schedules generated successfully',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async generateSchedules(
        @Body() dto: ScheduleGenerationDto,
        @CurrentUser('sub') userId: string
    ): Promise<GeneralResponseDto> {
        const generatedSchedules = await this.baseService.generateSchedules(dto, userId);
        
        return UtilityHelper.createSuccessResponse(
            'Schedule Generation Successful',
            `Successfully generated ${generatedSchedules.length} schedules for the specified employees`
        );
    }
}