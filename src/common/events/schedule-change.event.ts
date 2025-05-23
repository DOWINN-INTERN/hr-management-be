
export const SCHEDULE_CHANGE_EVENTS = {
    SCHEDULE_CHANGE_RESPONDED: 'schedule_change.responded',
    SCHEDULE_CHANGE_REQUESTED: 'schedule_change.requested',
};
    
export class ScheduleChangeRespondedEvent {
    constructor(
        public readonly scheduleChangeRequestId?: string,
        public readonly isApproved?: boolean,
        public readonly respondedBy?: string,
    ) {}
}