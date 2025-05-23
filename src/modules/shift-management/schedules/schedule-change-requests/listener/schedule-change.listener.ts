import { RequestStatus } from "@/common/enums/request-status.enum";
import { ScheduleChangeRespondedEvent } from "@/common/events/schedule-change.event";
import { WORK_TIME_EVENTS } from "@/common/events/work-time.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ScheduleChangeRequestsService } from "../schedule-change-requests.service";


@Injectable()
export class ScheduleChangeListener {
  private readonly logger = new Logger(ScheduleChangeListener.name);

  constructor(
    private readonly scheduleChangeRequestsService: ScheduleChangeRequestsService,
  ) {}

  @OnEvent(WORK_TIME_EVENTS.WORK_TIME_RESPONDED)
  async handleScheduleChangeResponded(event: ScheduleChangeRespondedEvent): Promise<void> {
    this.logger.log(`Schedule change request responded: ${event.scheduleChangeRequestId}, approved: ${event.isApproved}`);

    if (!event.scheduleChangeRequestId) {
      this.logger.warn('Schedule change request ID is missing');
      return;
    }

    // Update the request status
    const newStatus = event.isApproved === true 
      ? RequestStatus.APPROVED 
      : (event.isApproved === false ? RequestStatus.REJECTED : RequestStatus.PENDING);
      
    await this.scheduleChangeRequestsService.update(
      event.scheduleChangeRequestId, 
      { status: newStatus }, 
      event.respondedBy
    );

    // If approved, apply the schedule changes
    if (event.isApproved === true) {
      try {
        await this.scheduleChangeRequestsService.applyScheduleChanges(
          event.scheduleChangeRequestId, 
          event.respondedBy
        );
        this.logger.log(`Successfully applied schedule changes for request ${event.scheduleChangeRequestId}`);
      } catch (error: any) {
        this.logger.error(`Failed to apply schedule changes: ${error.message}`, error.stack);
        // Consider creating a notification for the failure
      }
    }
  }
}