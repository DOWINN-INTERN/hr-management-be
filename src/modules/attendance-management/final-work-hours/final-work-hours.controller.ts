import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { HttpStatus, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { GetFinalWorkHourDto, UpdateFinalWorkHourDto } from "./dtos/final-work-hour.dto";
import { FinalWorkHour } from "./entities/final-work-hour.entity";
import { FinalWorkHoursService } from "./final-work-hours.service";

export class FinalWorkHoursController extends createController(FinalWorkHour, FinalWorkHoursService, GetFinalWorkHourDto, undefined, UpdateFinalWorkHourDto)
{
    override async create(entityDto: null, createdById: string): Promise<GetFinalWorkHourDto> {
        return await super.create(entityDto, createdById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    @Post('recalculate/cutoff/:cutoffId')
    @Authorize({ endpointType: Action.MANAGE })
    @ApiOperation({
        summary: 'Recalculate Final Work Hours',
        description: 'Recalculates all final work hours for a specific cutoff period'
    })
    @ApiParam({
        name: 'cutoffId',
        description: 'The unique identifier of the cutoff period to recalculate',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Final work hours recalculation has been successfully initiated',
        type: GeneralResponseDto
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid cutoff ID format', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cutoff period not found', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: GeneralResponseDto })
    async recalculateByCutoffId(
        @Param('cutoffId', ParseUUIDPipe) cutoffId: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        await this.baseService.recalculateByCutoffId(cutoffId, userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Final work hours recalculation has been successfully initiated',
        };
    }

}