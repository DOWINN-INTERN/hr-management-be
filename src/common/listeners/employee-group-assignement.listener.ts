import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { SchedulesService } from '@/modules/shift-management/schedules/schedules.service';
import { ScheduleGenerationService } from '@/modules/shift-management/schedules/services/schedule-generation.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmployeeAssignedEvent, GROUP_EVENTS } from '../events/employee-assigned.event';

@Injectable()
export class EmployeeGroupAssignmentListener {
  private readonly logger = new Logger(EmployeeGroupAssignmentListener.name);

  constructor(
    private readonly cutoffsService: CutoffsService,
    private readonly scheduleGenerationService: ScheduleGenerationService,
    private readonly scheduleService: SchedulesService
  ) {}

  @OnEvent(GROUP_EVENTS.EMPLOYEE_ASSIGNED)
  async handleEmployeeAssignedToGroup(event: EmployeeAssignedEvent): Promise<void> {
    this.logger.log(`Handling employee assignment event for ${event.employees.length} employees to group ${event.group.id}`);
    
    // Find all future active cutoffs instead of just one
    const cutoffs = await this.cutoffsService.getActiveCutoffs();
    
    if (!cutoffs || cutoffs.length === 0) {
      this.logger.warn('No pending/active cutoff found, skipping schedule generation');
      return;
    }
    
    if (!event.group.shift) {
      this.logger.warn(`Group ${event.group.id} has no shift assigned, skipping schedule generation`);
      return;
    }
    
    // Get employee IDs
    const employeeIds = event.employees.map((employee: Employee) => employee.id);

    for (const cutoff of cutoffs) {
      // Check if the cutoff is in the future
      if (cutoff.startDate && cutoff.endDate) {
        const cutoffStartDate = new Date(cutoff.startDate);
        const cutoffEndDate = new Date(cutoff.endDate);
        const today = new Date();
        if (cutoffStartDate < today && cutoffEndDate > today) {
          this.logger.warn(`Cutoff ${cutoff.id} is not in the future, skipping schedule generation`);
          continue;
        }
      }
    
      this.logger.log(`Schedule generation job queued for cutoff ${cutoff.id} (${new Date(cutoff.startDate).toLocaleDateString()})`);
      // Queue schedule generation jobs for each cutoff
      await this.scheduleGenerationService.addGenerationJob({
        employeeIds,
        groupId: event.group.id,
        cutoffId: cutoff.id,
        requestedBy: event.assignedBy,
      });
    }
  }

  @OnEvent(GROUP_EVENTS.EMPLOYEE_REMOVED)
  async handleEmployeeRemovedFromGroup(event: EmployeeAssignedEvent): Promise<void> {
    
    // Find all future active cutoffs instead of just one
    const cutoffs = await this.cutoffsService.getActiveCutoffs();
    
    if (!cutoffs || cutoffs.length === 0) {
      this.logger.warn('No pending/active cutoff found, skipping schedule generation');
      return;
    }
    
    // Get employee IDs
    const employeeIds = event.employees.map((employee: Employee) => employee.id);

    for (const cutoff of cutoffs) {
      // Check if the cutoff is in the future
      if (cutoff.startDate && cutoff.endDate) {
        const cutoffStartDate = new Date(cutoff.startDate);
        const cutoffEndDate = new Date(cutoff.endDate);
        const today = new Date();
        if (cutoffStartDate < today && cutoffEndDate > today) {
          this.logger.warn(`Cutoff ${cutoff.id} is not in the future, skipping schedule deletion`);
          continue;
        }
      }
    
      // Delete schedules for each cutoff and removed employee
      await this.scheduleService.deleteSchedules({
        employeeIds,
        groupId: event.group.id,
        cutoffId: cutoff.id,
      });
    
      this.logger.log(`Schedules deleted for cutoff ${cutoff.id} (${new Date(cutoff.startDate).toLocaleDateString()}) for ${employeeIds.length} employees`);
    }
  }
}