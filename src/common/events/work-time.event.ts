
export const WORK_TIME_EVENTS = {
  WORK_TIME_RESPONDED: 'work_time.responded',
  WORK_TIME_REQUESTED: 'work_time.requested',
};
  
export class WorkTimeRespondedEvent {
  constructor(
    public readonly workTimeRequestId?: string,
    public readonly isApproved?: boolean,
    public readonly respondedBy?: string,
  ) {}
}