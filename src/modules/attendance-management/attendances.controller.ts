import { Authorize } from "@/common/decorators/authorize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ApiGenericResponses } from "@/common/decorators/generic-api-responses.decorator";
import { GeneralResponseDto } from "@/common/dtos/generalresponse.dto";
import { Action } from "@/common/enums/action.enum";
import { createController } from "@/common/factories/create-controller.factory";
import { HttpStatus, NotFoundException, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AttendancesService } from "./attendances.service";
import { GetAttendanceDto } from "./dtos/attendance.dto";
import { Attendance } from "./entities/attendance.entity";

export class AttendancesController extends createController(Attendance, AttendancesService, GetAttendanceDto, undefined, undefined)
{
    override async create(entityDto: null, createdById: string): Promise<GetAttendanceDto> {
        return await super.create(entityDto, createdById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async update(id: string, entityDto: null, updatedById: string): Promise<GetAttendanceDto> {
        return await super.update(id, entityDto, updatedById);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    @Post('process')
    @Authorize({ endpointType: Action.MANAGE })
    @ApiOperation({
        summary: 'Manually process attendance records',
        description: 'Triggers processing of attendance records for undertime, overtime, missing checkins/checkouts, and absences. This also calculates final work hours per day.'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Attendance records processed successfully',
        type: GeneralResponseDto
    })
    @ApiGenericResponses()
    async processAttendanceRecords(
        @CurrentUser('sub') userId: string,
    ): Promise<Partial<GeneralResponseDto>> {
        try {
            if (!(await this.baseService.processAttendanceRecords(userId)))
                throw new NotFoundException('No attendance records found to process');
            
            return {
                message: 'Processing of attendance records has been initiated. Please wait for the system to finish processing.',
                statusCode: HttpStatus.OK
            };
        } catch (error: any) {
            return {
                message: 'An error occurred while processing attendance records: ' + error.message,
                statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR
            };
        }
    }
}