import { createController } from "@/common/factories/create-controller.factory";
import { AttendanceConfigurationDto, GetAttendanceConfigurationDto, UpdateAttendanceConfigurationDto } from "./dtos/attendance-configuration.dto";
import { AttendanceConfigurationsService } from "./attendance-configurations.service";
import { AttendanceConfiguration } from "./entities/attendance-configuration.entity";

export class AttendanceConfigurationsController extends createController(
    AttendanceConfiguration,       // Entity name for Swagger documentation
    AttendanceConfigurationsService, // The service handling AttendanceConfiguration-related operations
    GetAttendanceConfigurationDto,  // DTO for retrieving AttendanceConfigurations
    AttendanceConfigurationDto,     // DTO for creating AttendanceConfigurations
    UpdateAttendanceConfigurationDto, // DTO for updating AttendanceConfigurations
) {
}