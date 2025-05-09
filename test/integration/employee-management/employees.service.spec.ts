// // test/integration/employee-management/employees.service.spec.ts
// import { User } from '@/modules/account-management/users/entities/user.entity';
// import { UsersService } from '@/modules/account-management/users/users.service';
// import { EmployeesService } from '@/modules/employee-management/employees.service';
// import { Employee } from '@/modules/employee-management/entities/employee.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { EmployeeFactory } from '../../factories/employee.factory';
// import { DbTestingUtil } from '../../utils/db-testing.util';
// import { TestModuleUtil } from '../../utils/test-module.utils';

// describe('EmployeesService Integration Tests', () => {
//   let service: EmployeesService;
//   let repository: Repository<Employee>;
//   let employeeFactory: EmployeeFactory;

//   beforeAll(async () => {
//     await DbTestingUtil.initializeTestDb();
    
//     const moduleRef = await TestModuleUtil.createTestingModule({
//       entities: [Employee, User],
//       providers: [
//         EmployeesService,
//         {
//           provide: UsersService,
//           useValue: {
//             findOneByOrFail: jest.fn(),
//           },
//         },
//       ],
//     });

//     service = moduleRef.get<EmployeesService>(EmployeesService);
//     repository = moduleRef.get<Repository<Employee>>(getRepositoryToken(Employee));
//     employeeFactory = new EmployeeFactory(repository);
//   });

//   afterEach(async () => {
//     await DbTestingUtil.resetTestDb();
//   });

//   afterAll(async () => {
//     await DbTestingUtil.closeTestDb();
//   });

//   describe('findAll', () => {
//     it('should return an array of employees', async () => {
//       // Arrange
//       const employees = await employeeFactory.create(3);
      
//       // Act
//       const result = await service.findAll();
      
//       // Assert
//       expect(result).toHaveLength(3);
//       expect(result[0]).toHaveProperty('id');
//     });
//   });

//   describe('findOne', () => {
//     it('should return a single employee', async () => {
//       // Arrange
//       const [employee] = await employeeFactory.create(1);
      
//       // Act
//       const result = await service.findOne(employee.id);
      
//       // Assert
//       expect(result).toHaveProperty('id', employee.id);
//       expect(result).toHaveProperty('employeeNumber', employee.employeeNumber);
//     });

//     it('should return null for non-existent employee', async () => {
//       // Act
//       const result = await service.findOne('non-existent-id');
      
//       // Assert
//       expect(result).toBeNull();
//     });
//   });

//   describe('create', () => {
//     it('should create a new employee', async () => {
//       // Arrange
//       const employeeData = employeeFactory.generate();
      
//       // Act
//       const result = await service.create(employeeData);
      
//       // Assert
//       expect(result).toHaveProperty('id');
//       expect(result).toHaveProperty('employeeNumber', employeeData.employeeNumber);
//       expect(result).toHaveProperty('monthlyRate', employeeData.monthlyRate);
//     });
//   });

//   describe('update', () => {
//     it('should update an existing employee', async () => {
//       // Arrange
//       const [employee] = await employeeFactory.create(1);
//       const updateData = { monthlyRate: 50000 };
      
//       // Act
//       const result = await service.update(employee.id, updateData);
      
//       // Assert
//       expect(result).toHaveProperty('id', employee.id);
//       expect(result).toHaveProperty('monthlyRate', 50000);
//     });
//   });

//   describe('delete', () => {
//     it('should delete an employee', async () => {
//       // Arrange
//       const [employee] = await employeeFactory.create(1);
      
//       // Act
//       const result = await service.delete(employee.id);
      
//       // Assert
//       expect(result.success).toBe(true);
      
//       // Verify employee is soft-deleted
//       const deletedEmployee = await repository.findOne({
//         where: { id: employee.id },
//         withDeleted: true
//       });
//       expect(deletedEmployee.isDeleted).toBe(true);
//     });
//   });
// });