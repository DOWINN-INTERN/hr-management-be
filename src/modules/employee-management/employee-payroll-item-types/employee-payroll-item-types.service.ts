import { Occurrence } from '@/common/enums/occurrence.enum';
import { PayrollItemCategory } from '@/common/enums/payroll/payroll-item-category.enum';
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
    ): Promise<{ base: EmployeeCompensationDto, additional: number, total: number }> {
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

        // Find allowances that should be included in base compensation
        const allowanceItems = await this.employeePayrollItemTypesRepository.find({
            where: {
                employee: { id: employeeId },
                payrollItemType: { 
                    category: PayrollItemCategory.ALLOWANCE,
                    includeInBaseCompensation: true 
                },
                isActive: true,
                isDeleted: false
            },
            relations: { payrollItemType: true, employee: true },
        });

        // Constants for rate conversion
        const BUSINESS_DAYS_PER_MONTH = 22; // should be based on the business days set in the payroll configuration
        const HOURS_PER_DAY = 8;

        // Helper function to convert amount between different rate types
        const convertAmount = (amount: number, fromType: Occurrence, toType: Occurrence): number => {
            if (fromType === toType) return amount;
            
            switch (fromType) {
                case Occurrence.MONTHLY:
                    if (toType === Occurrence.DAILY) return amount / BUSINESS_DAYS_PER_MONTH;
                    if (toType === Occurrence.HOURLY) return amount / (BUSINESS_DAYS_PER_MONTH * HOURS_PER_DAY);
                    break;
                case Occurrence.DAILY:
                    if (toType === Occurrence.MONTHLY) return amount * BUSINESS_DAYS_PER_MONTH;
                    if (toType === Occurrence.HOURLY) return amount / HOURS_PER_DAY;
                    break;
                case Occurrence.HOURLY:
                    if (toType === Occurrence.MONTHLY) return amount * HOURS_PER_DAY * BUSINESS_DAYS_PER_MONTH;
                    if (toType === Occurrence.DAILY) return amount * HOURS_PER_DAY;
                    break;
            }
            return amount;
        };

        let compensation = new EmployeeCompensationDto();
    
        // Determine base compensation type with priority order
        const monthlyItem = compensationItems.find(item => 
            item.payrollItemType.name === 'Monthly Salary'
        );
        
        if (monthlyItem) {
            compensation.rateType = Occurrence.MONTHLY;
            compensation.amount = monthlyItem.amount || monthlyItem.payrollItemType.defaultAmount || 0;
        } else {
            const dailyItem = compensationItems.find(item => 
                item.payrollItemType.name === 'Daily Rate'
            );
            
            if (dailyItem) {
                compensation.rateType = Occurrence.DAILY;
                compensation.amount = dailyItem.amount || dailyItem.payrollItemType.defaultAmount || 0;
            } else {
                const hourlyItem = compensationItems.find(item => 
                    item.payrollItemType.name === 'Hourly Rate'
                );
                
                if (hourlyItem) {
                    compensation.rateType = Occurrence.HOURLY;
                    compensation.amount = hourlyItem.amount || hourlyItem.payrollItemType.defaultAmount || 0;
                } else {
                    // Default to the first compensation item if no specific rate type is found
                    compensation.rateType = compensationItems[0].payrollItemType.defaultOccurrence;
                    compensation.amount = compensationItems[0].amount || compensationItems[0].payrollItemType.defaultAmount || 0;
                }
            }
        }

        let totalAdditionalAmount = 0;
        let totalCompensationAmount = compensation.amount;
        
        // Add applicable allowances converted to the base compensation rate type
        for (const allowance of allowanceItems) {
            const allowanceAmount = allowance.amount || allowance.payrollItemType.defaultAmount || 0;
            const allowanceOccurrence = allowance.payrollItemType.defaultOccurrence;
            
            // Convert the allowance to match the base compensation rate type
            const convertedAllowance = convertAmount(allowanceAmount, allowanceOccurrence, compensation.rateType);
            totalAdditionalAmount += convertedAllowance;
            totalCompensationAmount += convertedAllowance;
        }
        
        // Round to avoid floating point precision issues
        totalCompensationAmount = Math.round(totalCompensationAmount * 100) / 100;
        
        return {
            base: compensation,
            additional: Math.round(totalAdditionalAmount * 100) / 100,
            total: totalCompensationAmount,
        };
    }
}