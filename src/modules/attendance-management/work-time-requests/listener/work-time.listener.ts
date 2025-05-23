import { RequestStatus } from '@/common/enums/request-status.enum';
import { WORK_TIME_EVENTS, WorkTimeRespondedEvent } from '@/common/events/work-time.event';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FinalWorkHoursService } from '../../final-work-hours/final-work-hours.service';
import { WorkTimeRequestsService } from '../work-time-requests.service';

@Injectable()
export class WorkTimeListener {
  private readonly logger = new Logger(WorkTimeListener.name);

  constructor(
    private readonly workTimeRequestsService: WorkTimeRequestsService,
    private readonly finalWorkHoursService: FinalWorkHoursService,
  ) {}

  @OnEvent(WORK_TIME_EVENTS.WORK_TIME_RESPONDED)
  async handleWorkTimeResponded(event: WorkTimeRespondedEvent): Promise<void> {
    // log
    this.logger.log(`Work time request responded: ${event.workTimeRequestId}, approved: ${event.isApproved}`);

    if (!event.workTimeRequestId) {
      this.logger.warn('Work time request ID is missing');
      return;
    }

    let  workTimeRequest = await this.workTimeRequestsService.update(event.workTimeRequestId, {
      status: event.isApproved === true ? RequestStatus.APPROVED : (event.isApproved === false ? RequestStatus.REJECTED : RequestStatus.PENDING),
    }, event.respondedBy);

    workTimeRequest = await this.workTimeRequestsService.findOneByOrFail({ id: event.workTimeRequestId });

    if (!workTimeRequest.attendance) {
      this.logger.warn('Work time request attendance is missing');
      return;
    }

    // recalculate final work hours for the attendance only
    await this.finalWorkHoursService.recalculateByAttendanceId(workTimeRequest.attendance.id, event.respondedBy);
  }

}