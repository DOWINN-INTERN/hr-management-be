import { Injectable, Logger, LoggerService, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogActivityDto } from './dtos/log-activity.dto';
import { ActivityLog } from './entities/activity-logs.entity';

@Injectable({ scope: Scope.TRANSIENT })
export class LogsService extends Logger implements LoggerService {
    constructor(
        @InjectRepository(ActivityLog)
        private readonly activityLogRepository: Repository<ActivityLog>,
    ) {
    super();
    }

    async logActivity(logActivityDto: LogActivityDto): Promise<ActivityLog> {
        const activityLog = this.activityLogRepository.create({
            action: logActivityDto.action,
            subject: logActivityDto.subject,
            actor: logActivityDto.user,
            message: logActivityDto.message,
            details: logActivityDto.details,
            logType: logActivityDto.logType,
        });
        
        return await this.activityLogRepository.save(activityLog);
    }

    log(model: LogActivityDto) {
        super.log(model.message);
        this.saveLog(model);
    }

    error(model: LogActivityDto) {
        super.error(model.message);
        this.saveLog(model);
    }

    warn(model: LogActivityDto) {
        super.warn(model.message);
        this.saveLog(model);
    }

    debug(model: LogActivityDto) {
        super.debug(model.message);
        this.saveLog(model);
    }

    verbose(model: LogActivityDto) {
        super.verbose(model.message);
        this.saveLog(model);
    }

    private async saveLog(model: LogActivityDto) {
        await this.logActivity(model);
    }
}
