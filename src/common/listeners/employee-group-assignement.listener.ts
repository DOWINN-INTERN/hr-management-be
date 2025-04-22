import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { SchedulesService } from '@/modules/schedule-management/schedules.service';
import { ScheduleGenerationService } from '@/modules/schedule-management/services/schedule-generation.service';
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
    const activeCutoffs = await this.cutoffsService.getActiveCutoffs();
    
    if (activeCutoffs.length === 0) {
      this.logger.warn('No active cutoffs found, skipping schedule generation');
      return;
    }
    
    if (!event.group.shift) {
      this.logger.warn(`Group ${event.group.id} has no shift assigned, skipping schedule generation`);
      return;
    }
    
    // Get employee IDs
    const employeeIds = event.employees.map((employee: Employee) => employee.id);
    
    // Queue schedule generation jobs for each cutoff
    for (const cutoff of activeCutoffs) {
      await this.scheduleGenerationService.addGenerationJob({
        employeeIds,
        groupId: event.group.id,
        cutoffId: cutoff.id,
        requestedBy: event.assignedBy,
      });
      
      this.logger.log(`Schedule generation job queued for cutoff ${cutoff.id} (${new Date(cutoff.startDate).toLocaleDateString()})`);
    }
    
    this.logger.log(`Schedule generation completed for ${employeeIds.length} employees across ${activeCutoffs.length} future cutoffs`);
  }

  @OnEvent(GROUP_EVENTS.EMPLOYEE_REMOVED)
  async handleEmployeeRemovedFromGroup(event: EmployeeAssignedEvent): Promise<void> {
    this.logger.log(`Handling employee removal event for ${event.employees.length} employees from group ${event.group.id}`);
    
    // Find all future active cutoffs that might have schedules
    const activeCutoffs = await this.cutoffsService.getActiveCutoffs()
    
    if (activeCutoffs.length === 0) {
      this.logger.log('No active cutoffs found, no schedules to delete');
      return;
    }
    
    // Get employee IDs
    const employeeIds = event.employees.map((employee: Employee) => employee.id);
    
    // Delete schedules for each cutoff and removed employee
    for (const cutoff of activeCutoffs) {
      await this.scheduleService.deleteSchedules({
        employeeIds,
        groupId: event.group.id,
        cutoffId: cutoff.id,
      });
      
      this.logger.log(`Schedules deleted for cutoff ${cutoff.id} (${new Date(cutoff.startDate).toLocaleDateString()}) for ${employeeIds.length} employees`);
    }
    
    this.logger.log(`Schedule cleanup completed for ${employeeIds.length} employees across ${activeCutoffs.length} future cutoffs`);
  }
}