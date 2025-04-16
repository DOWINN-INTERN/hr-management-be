import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { ScheduleGenerationService } from '@/modules/schedule-management/services/schedule-generation.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MoreThan } from 'typeorm';
import { EmployeeAssignedEvent, GROUP_EVENTS } from '../events/employee-assigned.event';

@Injectable()
export class EmployeeGroupAssignmentListener {
  private readonly logger = new Logger(EmployeeGroupAssignmentListener.name);

  constructor(
    private readonly cutoffsService: CutoffsService,
    private readonly scheduleGenerationService: ScheduleGenerationService,
  ) {}

  @OnEvent(GROUP_EVENTS.EMPLOYEE_ASSIGNED)
  async handleEmployeeAssignedToGroup(event: EmployeeAssignedEvent): Promise<void> {
    this.logger.log(`Handling employee assignment event for ${event.employees.length} employees to group ${event.group.id}`);
    
    const currentDate = new Date();
    // Find all future active cutoffs instead of just one
    const activeCutoffs = await this.cutoffsService.getRepository().find({
        where: {
            status: CutoffStatus.ACTIVE,
            startDate: MoreThan(currentDate),
        },
        order: { startDate: 'ASC' }
    });
    
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
}