import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { DocumentsService } from '@/modules/documents/documents.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { GroupsService } from '@/modules/shift-management/groups/groups.service';
import { SchedulesService } from '@/modules/shift-management/schedules/schedules.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { AttendanceConfigurationsService } from '../attendance-configurations/attendance-configurations.service';
import { ManagementWorkTimeRequestDto } from './dtos/management-work-time-request.dto';
import { WorkTimeRequestDto } from './dtos/work-time-request.dto';
import { WorkTimeRequest } from './entities/work-time-request.entity';
import { WorkTimeResponsesService } from './work-time-responses/work-time-responses.service';

@Injectable()
export class WorkTimeRequestsService extends BaseService<WorkTimeRequest> {
    constructor(
        @InjectRepository(WorkTimeRequest)
        private readonly workTimeRequestsRepository: Repository<WorkTimeRequest>,
        protected readonly usersService: UsersService,
        private readonly documentsService: DocumentsService,
        private readonly employeesService: EmployeesService,
        private readonly schedulesService: SchedulesService,
        private readonly groupsService: GroupsService,
        private readonly attendanceConfigurationsService: AttendanceConfigurationsService,
        private readonly notificationsService: NotificationsService,
        private readonly workTimeResponsesService: WorkTimeResponsesService,
    ) {
        super(workTimeRequestsRepository, usersService);
    }

    override async validateBefore(dto: WorkTimeRequestDto): Promise<void> {
        // Validate that the worktime request exists and doesn't already have a response
        dto = await this.validateReferences(dto, [
            {
                field: 'documents',
                service: this.documentsService,
                required: true
            },
            {
                field: 'employee',
                service: this.employeesService,
                required: true
            }
        ]);
    }

    async createManagementWorkRequest(dto: ManagementWorkTimeRequestDto, managerId: string): Promise<boolean> {
        // Get the manager's information to validate permissions
        const manager = await this.usersService.findOneByOrFail({ id: managerId }, { relations: { employee: true } });
        
        if (!manager.employee) {
            throw new BadRequestException('Only managers with employee records can create management requests');
        }

        const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(manager.employee.organizationId);

        // check if config allow over time and early time
        if (dto.type === AttendanceStatus.EARLY && !config.allowEarlyTime) {
            throw new BadRequestException('The organization does not allow early time. Please check the attendance configuration.');
        }

        if (dto.type === AttendanceStatus.OVERTIME && !config.allowOvertime) {
            throw new BadRequestException('The organization does not allow overtime. Please check the attendance configuration.');
        }
        
        // Validate that at least one employee selection method is provided
        if (!dto.employeeId && !dto.employeeIds?.length && !dto.groupId) {
            throw new BadRequestException('Must provide either employeeId, employeeIds, or groupId');
        }
        
        // Determine which employees to create requests for
        let employeeIds: string[] = [];
        
        if (dto.employeeId) {
            // Single employee
            employeeIds = [dto.employeeId];
        } else if (dto.employeeIds && dto.employeeIds.length > 0) {
            // Multiple specific employees
            employeeIds = dto.employeeIds;
        } else if (dto.groupId) {
            // All employees in a shift group
            const group = await this.groupsService.findOneByOrFail(
             { id: dto.groupId }, {
                relations: { employees: true }
            });
            
            if (!group || !group.employees || group.employees.length === 0) {
                throw new BadRequestException(`No employees found in group with ID ${dto.groupId}`);
            }
            
            employeeIds = group.employees.map(emp => emp.id);
        }
        
        if (employeeIds.length === 0) {
            throw new BadRequestException('No valid employees found for the request');
        }
        
        this.logger.log(`Creating ${dto.type} requests for ${employeeIds.length} employees`);
        
        // For large employee sets, process in batches to avoid memory issues
        const BATCH_SIZE = 50;
        const createdRequests: WorkTimeRequest[] = [];
        const failedEmployees: { id: string, reason: string }[] = [];
        
        // Get all employees with their user info in a single query for notification efficiency
        const employees = await this.employeesService.getRepository().find({
            where: { id: In(employeeIds) },
            relations: { user: true }
        });
        
        const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
        
        // Process in batches
        for (let i = 0; i < employeeIds.length; i += BATCH_SIZE) {
            const batchIds = employeeIds.slice(i, i + BATCH_SIZE);
            this.logger.debug(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} with ${batchIds.length} employees`);
            
            // Use a transaction for consistency
            const batchResults = await this.transactionService.executeInTransaction(async (queryRunner: QueryRunner) => {
                const batchRequests: WorkTimeRequest[] = [];
                const batchFailures: { id: string, reason: string }[] = [];
                const notifications: any[] = [];
                
                // Process each employee in the batch
                for (const employeeId of batchIds) {
                    try {
                        const employee = employeeMap.get(employeeId);
                        if (!employee) {
                            batchFailures.push({ id: employeeId, reason: 'Employee not found' });
                            continue;
                        }
                        
                        // Get the schedule for this employee on the specified date
                        let schedule;
                        try {
                            schedule = await this.schedulesService.findOneByOrFail({ 
                                employee: new Employee({ id: employeeId }),
                                date: new Date(dto.date)
                            }, { relations: { cutoff: true, holiday: true } });
                        } catch (scheduleError: any) {
                            batchFailures.push({ id: employeeId, reason: scheduleError.message });
                            continue;
                        }
                        
                        // Create the work time request with management request flags
                        const workTimeRequest = await this.create({
                            cutoff: { id: schedule.cutoff.id },
                            type: dto.type,
                            date: new Date(dto.date),
                            reason: `Management requested ${dto.type === AttendanceStatus.EARLY ? 'early arrival' : 'overtime'}: ${dto.reason}`,
                            status: RequestStatus.PENDING,
                            employee: { id: employeeId },
                            managementRequested: true,
                            requestedByManager: new Employee({ id: manager.employee?.id }),
                        }, managerId);
                        
                        // Auto-approve the request since it's from management
                        await this.workTimeResponsesService.create({
                            workTimeRequest: new WorkTimeRequest({ id: workTimeRequest.id }),
                            approved: true,
                            message: 'Auto-approved management request',
                        }, managerId);
                        
                        // Prepare notification data
                        notifications.push({
                            title: `Management ${dto.type === AttendanceStatus.EARLY ? 'Early Work' : 'Overtime'} Request`,
                            message: `Your manager has requested that you ${dto.type === AttendanceStatus.EARLY ? 'arrive' : 'work'} ${dto.type === AttendanceStatus.EARLY ? 'early' : 'overtime'} on ${dto.date}. Reason: ${dto.reason}`,
                            type: NotificationType.INFO,
                            category: 'ATTENDANCE',
                            user: { id: employee.user.id },
                            createdBy: managerId,
                        });
                        
                        batchRequests.push(workTimeRequest);
                    } catch (error: any) {
                        batchFailures.push({ id: employeeId, reason: error.message });
                    }
                }
                
                // Bulk create notifications for efficiency
                if (notifications.length > 0) {
                    try {
                        await Promise.all(notifications.map(notification => 
                            this.notificationsService.create(notification, managerId)
                        ));
                    } catch (notificationError: any) {
                        this.logger.error(`Failed to send notifications: ${notificationError.message}`);
                        // Don't fail the whole transaction for notification errors
                    }
                }
                
                return { batchRequests, batchFailures };
            });
            
            createdRequests.push(...batchResults.batchRequests);
            failedEmployees.push(...batchResults.batchFailures);
        }
        
        // Log failures but don't fail the request if some succeeded
        if (failedEmployees.length > 0) {
            this.logger.warn(`Failed to create requests for ${failedEmployees.length} employees`);
            for (const failure of failedEmployees) {
                this.logger.warn(`  Employee ${failure.id}: ${failure.reason}`);
            }
        }
        
        if (createdRequests.length === 0) {
            throw new BadRequestException('Failed to create any work time requests');
        }
        
        this.logger.log(`Successfully created ${createdRequests.length} work time requests`);
        return true;
    }
}