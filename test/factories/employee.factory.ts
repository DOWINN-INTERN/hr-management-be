// import { faker } from '@faker-js/faker';
// import { DeepPartial, Repository } from 'typeorm';
// import { EmploymentCondition } from '../../src/common/enums/employment/employment-condition.enum';
// import { EmploymentStatus } from '../../src/common/enums/employment/employment-status.enum';
// import { EmploymentType } from '../../src/common/enums/employment/employment-type.enum';
// import { Employee } from '../../src/modules/employee-management/entities/employee.entity';
// import { BaseFactory } from './base.factory';

// // Correct the generic type to just Employee
// export class EmployeeFactory extends BaseFactory<Employee> {
//   constructor(repository: Repository<Employee>) {
//     super(repository);
//   }

//   makePlain(overrides?: DeepPartial<Employee>): DeepPartial<Employee> {
//     const entity: DeepPartial<Employee> = {
//       // Base entity fields - these are actually part of Employee through inheritance
//       id: faker.string.uuid(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       createdBy: faker.string.uuid(),
//       isDeleted: false,
//       organizationId: faker.string.uuid(),
//       branchId: faker.string.uuid(),
//       departmentId: faker.string.uuid(),
      
//       // Employee-specific fields
//       employeeNumber: faker.number.int({ min: 1000, max: 9999 }),
//       commencementDate: faker.date.past(),
//       employmentStatus: faker.helpers.arrayElement(Object.values(EmploymentStatus)),
//       employmentCondition: faker.helpers.arrayElement(Object.values(EmploymentCondition)),
//       employmentType: faker.helpers.arrayElement(Object.values(EmploymentType)),
//       biometricsPassword: faker.internet.password(),
//       biometricsRole: faker.number.int({ min: 1, max: 3 }),
//       cardNumber: faker.string.alphanumeric(10),
//       leaveCredits: faker.number.float({ min: 0, max: 20 }),
//       offsetLeaveCredits: faker.number.float({ min: 0, max: 10 }),
//     };
    
//     // Apply overrides
//     if (overrides) {
//       Object.assign(entity, overrides);
//     }
    
//     return entity;
//   }
// }