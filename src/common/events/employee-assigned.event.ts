import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Group } from '@/modules/schedule-management/groups/entities/group.entity';

export const GROUP_EVENTS = {
    EMPLOYEE_ASSIGNED: 'employee.assigned.to.group',
    EMPLOYEE_REMOVED: 'employee.removed.from.group',
  };
  
  export const SCHEDULE_EVENTS = {
    GENERATION_REQUESTED: 'schedule.generation.requested',
    GENERATION_COMPLETED: 'schedule.generation.completed',
    GENERATION_FAILED: 'schedule.generation.failed',
  };

export class EmployeeAssignedEvent {
  constructor(
    public readonly group: Group,
    public readonly employees: Employee[],
    public readonly assignedBy?: string,
  ) {}
}