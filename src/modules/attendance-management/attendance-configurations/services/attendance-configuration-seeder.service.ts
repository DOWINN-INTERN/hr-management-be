
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AttendanceConfigurationsService } from '../attendance-configurations.service';

@Injectable()
export class AttendanceConfigurationSeederService implements OnModuleInit {
    private readonly logger = new Logger(AttendanceConfigurationSeederService.name);
    constructor(
        private readonly attendanceConfigurationsService: AttendanceConfigurationsService
    ) {}

    async onModuleInit() {
        await this.seedGlobalAttendanceConfiguration();
    }

    async seedGlobalAttendanceConfiguration() {
        try {
            // Check if the global attendance configuration already exists
            const existingConfig = await this.attendanceConfigurationsService.findOneBy({
                organization: undefined
            }, { relations: { organization: true } });

            if (!existingConfig) {
                // Create a new global attendance configuration
                await this.attendanceConfigurationsService.create({});
                this.logger.log(`Global attendance configuration seeded`);
            }
        } catch (error) {
            this.logger.error(`Failed to seed attendance data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}