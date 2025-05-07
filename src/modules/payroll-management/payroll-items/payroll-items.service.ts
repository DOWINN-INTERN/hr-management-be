import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollItemTypesService } from '../payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './entities/payroll-item.entity';

@Injectable()
export class PayrollItemsService extends BaseService<PayrollItem> {
    constructor(
        @InjectRepository(PayrollItem)
        private readonly payrollItemsRepository: Repository<PayrollItem>,
        protected readonly usersService: UsersService,
        private readonly payrollItemTypesService: PayrollItemTypesService,
    ) {
        super(payrollItemsRepository, usersService);
    }

    /**
   * Set up an employee's default compensation
   * @param employeeId Employee ID
   * @param rateType Type of rate (MONTHLY, DAILY, HOURLY)
   * @param amount Rate amount
   * @param userId User performing the action
   */
  async setupEmployeeCompensation(
    employeeId: string,
    rateType: 'MONTHLY' | 'DAILY' | 'HOURLY',
    amount: number,
    userId: string
  ): Promise<PayrollItem> {
    // Deactivate any existing compensation items
    const existingItems = await this.getRepository().findBy({
      employee: { id: employeeId },
      payrollItemType: { category: PayrollItemCategory.COMPENSATION },
      isActive: true
    });
    
    for (const item of existingItems) {
      await this.update(item.id, { isActive: false }, userId);
    }
    
    // Get the appropriate payroll item type
    let itemTypeName: string;
    switch (rateType) {
      case 'MONTHLY':
        itemTypeName = 'Monthly Salary';
        break;
      case 'DAILY':
        itemTypeName = 'Daily Rate';
        break;
      case 'HOURLY':
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
    const newItem = new PayrollItem({
      employee: { id: employeeId } as Employee,
      payrollItemType,
      amount,
      occurrence: payrollItemType.defaultOccurrence,
      isTaxable: payrollItemType.isTaxable,
      isActive: true
    });
    
    return this.create(newItem, userId);
  }
}