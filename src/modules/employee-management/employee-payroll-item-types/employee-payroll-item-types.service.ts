import { Occurrence } from '@/common/enums/occurrence.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { EmployeeCompensationDto } from '@/modules/employee-management/employee-payroll-item-types/dtos/employee-compensation.dto';
import { PayrollItemTypesService } from '@/modules/payroll-management/payroll-item-types/payroll-item-types.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeePayrollItemType } from './entities/employee-payroll-item-type.entity';

@Injectable()
export class EmployeePayrollItemTypesService extends BaseService<EmployeePayrollItemType> {
    constructor(
        @InjectRepository(EmployeePayrollItemType)
        private readonly employeePayrollItemTypesRepository: Repository<EmployeePayrollItemType>,
        protected readonly usersService: UsersService,
        private readonly payrollItemTypesService: PayrollItemTypesService,
    ) {
        super(employeePayrollItemTypesRepository, usersService);
    }

    /**
     * Set up an employee's default compensation
     * @param employeeId Employee ID
     * @param rateType Type of rate (MONTHLY, DAILY, HOURLY)
     * @param amount Rate amount
     * @param userId User performing the action
     */
    async setupEmployeeCompensation(
        dto: EmployeeCompensationDto,
        employeeId: string,
        userId: string
    ): Promise<EmployeePayrollItemType> {
        const { rateType, amount } = dto;
        // Deactivate any existing compensation items
        const existingItems = await this.employeePayrollItemTypesRepository.find({
            where: {
                employee: { id: employeeId },
                payrollItemType: { category: PayrollItemCategory.COMPENSATION },
                isActive: true
            },
            relations: { payrollItemType: true, employee: true },
        });
        
        // Get the appropriate payroll item type
        let itemTypeName: string;
        switch (rateType) {
        case Occurrence.MONTHLY:
            itemTypeName = 'Monthly Salary';
            break;
        case Occurrence.DAILY:
            itemTypeName = 'Daily Rate';
            break;
        case Occurrence.HOURLY:
            itemTypeName = 'Hourly Rate';
            break;
        default:
            throw new BadRequestException(`Invalid rate type: ${rateType}`);
        }
        
        const payrollItemType = await this.payrollItemTypesService.findOneByOrFail({
            name: itemTypeName,
            isActive: true
        });
        
        // Create new compensation item
        const newItem = new EmployeePayrollItemType({
            employee: { id: employeeId } as Employee,
            payrollItemType,
            amount,
            isActive: true,
        });

        for (const item of existingItems) {
            await this.update(item.id, { isActive: false }, userId);
        }
        
        return this.create(newItem, userId);
    }

    /**
     * Gets the base compensation item for an employee
     */
    async getEmployeeBaseCompensation(
        employeeId: string
    ): Promise<EmployeeCompensationDto> {
        // Find the employee's active compensation item
        const compensationItems = await this.employeePayrollItemTypesRepository.find({
            where: {
                employee: { id: employeeId },
                payrollItemType: { category: PayrollItemCategory.COMPENSATION },
                isActive: true
            },
            relations: { payrollItemType: true, employee: true },
            order: { createdAt: 'DESC' }
        });
        
        if (!compensationItems.length) {
            throw new BadRequestException(`No active base compensation defined for employee ${employeeId}`);
        }

        let compensation = new EmployeeCompensationDto();
        
        // Prioritize Monthly Salary over Daily Rate over Hourly Rate
        const monthlyItem = compensationItems.find(item => 
            item.payrollItemType.name === 'Monthly Salary'
        );
        
        if (monthlyItem) {
            compensation.rateType = Occurrence.MONTHLY;
            compensation.amount = monthlyItem.amount || monthlyItem.payrollItemType.defaultAmount || 0;
            return compensation;
        }
        
        const dailyItem = compensationItems.find(item => 
            item.payrollItemType.name === 'Daily Rate'
        );
        
        if (dailyItem) {
            compensation.rateType = Occurrence.DAILY;
            compensation.amount = dailyItem.amount || dailyItem.payrollItemType.defaultAmount || 0;
            return compensation;
        }
        
        const hourlyItem = compensationItems.find(item => 
            item.payrollItemType.name === 'Hourly Rate'
        );
        
        if (hourlyItem) {
            compensation.rateType = Occurrence.HOURLY;
            compensation.amount = hourlyItem.amount || hourlyItem.payrollItemType.defaultAmount || 0;
            return compensation;
        }
        
        // Default to the first compensation item found

        compensation.rateType = compensationItems[0].payrollItemType.defaultOccurrence;
        compensation.amount = compensationItems[0].amount || compensationItems[0].payrollItemType.defaultAmount || 0
        return compensation;
    }
}