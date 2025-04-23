// src/modules/payroll-management/payrolls.service.test.ts

import { CutoffStatus } from "@/common/enums/cutoff-status.enum";
import { CutoffType } from "@/common/enums/cutoff-type.enum";
import { PayrollItemCategory } from "@/common/enums/payroll-item-category.enum";
import { PayrollStatus } from "@/common/enums/payroll-status.enum";
import { RoleScopeType } from "@/common/enums/role-scope-type.enum";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, ObjectLiteral, RemoveOptions, Repository, SaveOptions } from "typeorm";
import { User } from "../account-management/users/entities/user.entity";
import { UsersService } from "../account-management/users/users.service";
import { DayType, FinalWorkHour } from "../attendance-management/final-work-hours/entities/final-work-hour.entity";
import { FinalWorkHoursService } from "../attendance-management/final-work-hours/final-work-hours.service";
import { EmployeesService } from "../employee-management/employees.service";
import { Employee } from "../employee-management/entities/employee.entity";
import { Role } from "../employee-management/roles/entities/role.entity";
import { Department } from "../organization-management/branches/departments/entities/department.entity";
import { Branch } from "../organization-management/branches/entities/branch.entity";
import { Organization } from "../organization-management/entities/organization.entity";
import { CutoffsService } from "./cutoffs/cutoffs.service";
import { Cutoff } from "./cutoffs/entities/cutoff.entity";
import { Payroll } from "./entities/payroll.entity";
import { PayrollItemType } from "./payroll-item-types/entities/payroll-item-type.entity";
import { PayrollItemTypesService } from "./payroll-item-types/payroll-item-types.service";
import { PayrollItem } from "./payroll-items/entities/payroll-item.entity";
import { PayrollItemsService } from "./payroll-items/payroll-items.service";
import { PayrollsService } from "./payrolls.service";

// Mock repositories and services
const mockRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  })),
});

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockService<T> = Partial<Record<keyof T, jest.Mock>>;

describe('PayrollsService', () => {
  let service: PayrollsService;
  let payrollRepository: MockRepository<Payroll>;
  let employeesService: MockService<EmployeesService>;
  let cutoffsService: MockService<CutoffsService>;
  let finalWorkHoursService: MockService<FinalWorkHoursService>;
  let payrollItemsService: MockService<PayrollItemsService>;
  let payrollItemTypesService: MockService<PayrollItemTypesService>;
  let usersService: MockService<UsersService>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    // Create mock services and repositories
    const mockEmployeesService = {
      findOneByOrFail: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn(),
      }),
    };

    const mockCutoffsService = {
      findOneByOrFail: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn(),
      }),
    };

    const mockFinalWorkHoursService = {
      getRepository: jest.fn().mockReturnValue({
        findBy: jest.fn(),
        find: jest.fn(),
      }),
      update: jest.fn(),
    };

    const mockPayrollItemsService = {
      getRepository: jest.fn().mockReturnValue({
        findBy: jest.fn(),
        find: jest.fn(),
      }),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const mockPayrollItemTypesService = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
      }),
    };

    const mockUsersService = {
      findOneByOrFail: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollsService,
        {
          provide: getRepositoryToken(Payroll),
          useFactory: mockRepository,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: CutoffsService,
          useValue: mockCutoffsService,
        },
        {
          provide: FinalWorkHoursService,
          useValue: mockFinalWorkHoursService,
        },
        {
          provide: PayrollItemsService,
          useValue: mockPayrollItemsService,
        },
        {
          provide: PayrollItemTypesService,
          useValue: mockPayrollItemTypesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PayrollsService>(PayrollsService);
    payrollRepository = module.get(getRepositoryToken(Payroll));
    employeesService = module.get(EmployeesService);
    cutoffsService = module.get(CutoffsService);
    finalWorkHoursService = module.get(FinalWorkHoursService);
    payrollItemsService = module.get(PayrollItemsService);
    payrollItemTypesService = module.get(PayrollItemTypesService);
    usersService = module.get(UsersService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRates', () => {
    it('should calculate correct rates for bi-weekly cutoff', () => {
      // Arrange
      const employee = new Employee({}); // pass empty object
      employee.monthlyRate = 30000;

      const cutoff = new Cutoff({}); // pass empty object
      cutoff.startDate = new Date('2023-07-01');
      cutoff.endDate = new Date('2023-07-15');
      cutoff.cutoffType = CutoffType.BI_WEEKLY;

      // Mock business days calculation
      jest.spyOn(global.Math, 'round').mockImplementation((num) => num);
      
      // Act
      const rates = service.calculateRates(employee, cutoff);

      // Assert
      expect(rates.monthlyRate).toBe(30000);
      expect(rates.dailyRate).toBeGreaterThan(0);
      expect(rates.hourlyRate).toBeGreaterThan(0);
      expect(rates.hourlyRate).toBe(rates.dailyRate / 8);
    });

    it('should calculate correct rates for monthly cutoff', () => {
      // Arrange
      const employee = new Employee({});
      employee.monthlyRate = 30000;

      const cutoff = new Cutoff({});
      cutoff.startDate = new Date('2023-07-01');
      cutoff.endDate = new Date('2023-07-31');
      cutoff.cutoffType = CutoffType.MONTHLY;

      // Act
      const rates = service.calculateRates(employee, cutoff);

      // Assert
      expect(rates.monthlyRate).toBe(30000);
      expect(rates.dailyRate).toBeGreaterThan(0);
      expect(rates.hourlyRate).toBeGreaterThan(0);
    });
  });

  describe('calculateBasicPay', () => {
    it('should calculate correct pay components', () => {
      // Arrange
      const payroll = new Payroll({});
      payroll.employee = new Employee({}); // pass {}
      payroll.employee.monthlyRate = 30000;
      
      payroll.cutoff = new Cutoff({});
      payroll.cutoff.startDate = new Date('2023-07-01');
      payroll.cutoff.endDate = new Date('2023-07-15');
      payroll.cutoff.cutoffType = CutoffType.BI_WEEKLY;

      const finalWorkHours = [
        createFinalWorkHour({ regularDayHours: 8, overtimeRegularDayHours: 2 }),
        createFinalWorkHour({ regularDayHours: 8, restDayHours: 4 }),
        createFinalWorkHour({ specialHolidayHours: 8, overtimeSpecialHolidayHours: 2 }),
      ];

      // Mock calculateRates to return fixed values for predictable testing
      jest.spyOn(service, 'calculateRates').mockReturnValue({
        monthlyRate: 30000,
        dailyRate: 1363.64,
        hourlyRate: 170.45,
      });

      // Act
      service.calculateBasicPay(payroll, finalWorkHours);

      // Assert
      expect(payroll.totalRegularHours).toBe(16);
      expect(payroll.totalOvertimeHours).toBe(2);
      expect(payroll.totalRestDayHours).toBe(4);
      expect(payroll.totalSpecialHolidayHours).toBe(8);
      expect(payroll.totalSpecialHolidayOvertimeHours).toBe(2);

      // Check pay calculations with multipliers
      expect(payroll.basicPay).toBeCloseTo(16 * 170.45, 1);
      expect(payroll.overtimePay).toBeCloseTo(2 * 170.45 * 1.25, 1);
      expect(payroll.restDayPay).toBeCloseTo(4 * 170.45 * 1.3, 1);
      expect(payroll.specialHolidayPay).toBeCloseTo(8 * 170.45 * 1.3, 1);
      expect(payroll.specialHolidayOvertimePay).toBeCloseTo(2 * 170.45 * 1.69, 1);
      
      // Check gross pay calculation
      expect(payroll.grossPay).toBeCloseTo(
        payroll.basicPay + 
        payroll.overtimePay + 
        payroll.restDayPay + 
        payroll.specialHolidayPay + 
        payroll.specialHolidayOvertimePay, 
        1
      );
    });
  });

  describe('evaluateFormula', () => {
    it('should correctly evaluate a simple formula', async () => {
      // Arrange
      const formula = 'HourlyRate * RegularHours';
      const payroll = new Payroll({});
      payroll.hourlyRate = 170.45;
      payroll.totalRegularHours = 8;

      // Act
      const result = await service.evaluateFormula(formula, payroll);

      // Assert
      expect(result.result).toBeCloseTo(170.45 * 8, 1);
    });

    it('should handle complex formulas with parameters', async () => {
      // Arrange
      const formula = 'HourlyRate * OvertimeHours * OvertimeMultiplier';
      const payroll = new Payroll({});
      payroll.hourlyRate = 170.45;
      payroll.totalOvertimeHours = 2;
      const parameters = { OvertimeMultiplier: 1.25 };

      // Act
      const result = await service.evaluateFormula(formula, payroll, parameters);

      // Assert
      expect(result.result).toBeCloseTo(170.45 * 2 * 1.25, 1);
      expect(result.details).toHaveProperty('formula', formula);
      expect(result.details).toHaveProperty('scope');
      expect(result.details.scope).toHaveProperty('OvertimeMultiplier', 1.25);
    });

    it('should return 0 and error details on formula evaluation error', async () => {
      // Arrange
      const formula = 'HourlyRate * UndefinedVariable';
      const payroll = new Payroll({});
      payroll.hourlyRate = 170.45;

      // Act
      const result = await service.evaluateFormula(formula, payroll);

      // Assert
      expect(result.result).toBe(0);
      expect(result.details).toHaveProperty('error');
    });
  });

  describe('SSS Employee Contribution Calculation', () => {
    it('should calculate correct SSS contribution for salary range 3000-3249.99', async () => {
      // Arrange
      const formula = `
        // 2023 SSS Contribution Table
        const msw = MonthlyRate;
        let contribution = 0;
        
        if (msw <= 3249.99) contribution = 135;
        else if (msw <= 3749.99) contribution = 157.50;
        else if (msw <= 4249.99) contribution = 180;
        else if (msw <= 4749.99) contribution = 202.50;
        else if (msw >= 24750) contribution = 1125;
        
        return contribution;
      `;
      
      const payroll = new Payroll({});
      payroll.monthlyRate = 3200;

      // Act
      const result = await service.evaluateFormula(formula, payroll);

      // Assert
      expect(result.result).toBe(135);
    });

    it('should calculate correct SSS contribution for salary range 3500-3749.99', async () => {
      // Arrange
      const formula = `
        // 2023 SSS Contribution Table
        const msw = MonthlyRate;
        let contribution = 0;
        
        if (msw <= 3249.99) contribution = 135;
        else if (msw <= 3749.99) contribution = 157.50;
        else if (msw <= 4249.99) contribution = 180;
        else if (msw <= 4749.99) contribution = 202.50;
        else if (msw >= 24750) contribution = 1125;
        
        return contribution;
      `;
      
      const payroll = new Payroll({});
      payroll.monthlyRate = 3600;

      // Act
      const result = await service.evaluateFormula(formula, payroll);

      // Assert
      expect(result.result).toBe(157.50);
    });

    it('should calculate correct SSS contribution for maximum salary (>= 24750)', async () => {
      // Arrange
      const formula = `
        // 2023 SSS Contribution Table
        const msw = MonthlyRate;
        let contribution = 0;
        
        if (msw <= 3249.99) contribution = 135;
        else if (msw <= 3749.99) contribution = 157.50;
        else if (msw <= 4249.99) contribution = 180;
        else if (msw <= 4749.99) contribution = 202.50;
        else if (msw >= 24750) contribution = 1125;
        
        return contribution;
      `;
      
      const payroll = new Payroll({});
      payroll.monthlyRate = 25000;

      // Act
      const result = await service.evaluateFormula(formula, payroll);

      // Assert
      expect(result.result).toBe(1125);
    });
  });

  describe('processPayrollItems', () => {
    it('should create and calculate payroll items correctly', async () => {
      // Arrange
      const payroll = new Payroll({});
      payroll.employee = new Employee({});
      payroll.employee.id = 'employee-1';
      payroll.monthlyRate = 30000;
      payroll.hourlyRate = 170.45;
      payroll.totalRegularHours = 80;
      payroll.basicPay = 13636;
      payroll.grossPay = 13636;
      payroll.taxableIncome = 13636;
      payroll.payrollItems = [];
      
      const userId = 'user-1';
      
      // Mock payroll item types
      const sssItemType = createPayrollItemType({
        name: 'SSS Employee Contribution',
        category: PayrollItemCategory.GOVERNMENT,
        computationFormula: 'if (MonthlyRate <= 3249.99) return 135; else return 1125;',
        governmentContributionType: 'SSS',
        hasEmployerShare: true,
        employerFormulaPercentage: 'return Amount * 2;',
        isGovernmentMandated: true,
        isTaxDeductible: true,
      });
      
      const taxItemType = createPayrollItemType({
        name: 'Withholding Tax',
        category: PayrollItemCategory.TAX,
        computationFormula: 'return TaxableIncome * 0.15;',
        governmentContributionType: 'TAX',
        isGovernmentMandated: true,
      });
      
      // Mock payroll item types service
      payrollItemTypesService.getRepository!().find.mockResolvedValue([
        sssItemType,
        taxItemType
      ]);
      
      // Mock empty existing payroll items
      payrollItemsService.getRepository!().find.mockResolvedValue([]);
      
      // Mock payroll item creation
      payrollItemsService.create!.mockImplementation((item) => {
        return Promise.resolve({
          ...item,
          id: 'payroll-item-' + Math.random().toString(36).substring(7)
        });
      });
      
      // Mock formula evaluation results
      jest.spyOn(service, 'evaluateFormula')
        .mockResolvedValueOnce({ result: 1125, details: {} }) // SSS employee
        .mockResolvedValueOnce({ result: 2250, details: {} }) // SSS employer
        .mockResolvedValueOnce({ result: 2045.4, details: {} }); // Tax
      
      // Act
      const result = await service.processPayrollItems(payroll, userId);
      
      // Assert
      expect(payrollItemsService.getRepository!().find).toHaveBeenCalled();
      expect(payrollItemTypesService.getRepository!().find).toHaveBeenCalled();
      expect(service.evaluateFormula).toHaveBeenCalledTimes(3);
      expect(payrollItemsService.create!).toHaveBeenCalledTimes(2);
      
      // Check that items were created
      expect(result.length).toBe(2);
      
      // Check payroll totals were updated
      expect(payroll.totalGovernmentContributions).toBeGreaterThan(0);
      expect(payroll.totalTaxes).toBeGreaterThan(0);
      expect(payroll.netPay).toBeLessThan(payroll.grossPay);
    });

    it('should delete existing payroll items when reprocessing', async () => {
      // Arrange
      const payroll = new Payroll({});
      payroll.employee = new Employee({});
      payroll.employee.id = 'employee-1';
      payroll.monthlyRate = 30000;
      payroll.grossPay = 13636;
      payroll.taxableIncome = 13636;
      
      const existingItems = [
        { id: 'payroll-item-1', payrollItemType: { category: PayrollItemCategory.GOVERNMENT } },
        { id: 'payroll-item-2', payrollItemType: { category: PayrollItemCategory.TAX } }
      ];
      payroll.payrollItems = existingItems as PayrollItem[];
      
      const userId = 'user-1';
      
      // Mock empty payroll item types
      payrollItemTypesService.getRepository!().find.mockResolvedValue([]);
      
      // Act
      await service.processPayrollItems(payroll, userId);
      
      // Assert
      expect(payrollItemsService.delete!).toHaveBeenCalledTimes(2);
      expect(payrollItemsService.delete!).toHaveBeenCalledWith('payroll-item-1');
      expect(payrollItemsService.delete!).toHaveBeenCalledWith('payroll-item-2');
    });
  });

  describe('processPayrollForEmployee', () => {
    it('should throw BadRequestException when payroll already processed', async () => {
      // Arrange
      const employeeId = 'employee-1';
      const cutoffId = 'cutoff-1';
      const userId = 'user-1';
      
      const existingPayroll = new Payroll({});
      existingPayroll.status = PayrollStatus.RELEASED;
      
      // Mock transaction to return existing payroll
      dataSource.transaction.mockImplementation(async (callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(existingPayroll)
        };
        return callback(mockManager);
      });
      
      // Act & Assert
      await expect(service.processPayrollForEmployee(employeeId, cutoffId, userId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cutoff not pending', async () => {
      // Arrange
      const employeeId = 'employee-1';
      const cutoffId = 'cutoff-1';
      const userId = 'user-1';
      
      // Mock transaction with no existing payroll
      dataSource.transaction.mockImplementation(async (callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null)
        };
        return callback(mockManager);
      });
      
      // Mock cutoff with non-pending status
      const cutoff = new Cutoff({});
      cutoff.status = CutoffStatus.COMPLETED;
      cutoffsService.findOneByOrFail!.mockResolvedValue(cutoff);
      
      // Mock employee
      employeesService.findOneByOrFail!.mockResolvedValue(new Employee({}));
      
      // Act & Assert
      await expect(service.processPayrollForEmployee(employeeId, cutoffId, userId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no approved work hours', async () => {
      // Arrange
      const employeeId = 'employee-1';
      const cutoffId = 'cutoff-1';
      const userId = 'user-1';
      
      // Mock transaction with no existing payroll
      dataSource.transaction.mockImplementation(async (callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null)
        };
        return callback(mockManager);
      });
      
      // Mock cutoff with pending status
      const cutoff = new Cutoff({});
      cutoff.status = CutoffStatus.PENDING;
      cutoffsService.findOneByOrFail!.mockResolvedValue(cutoff);
      
      // Mock employee
      employeesService.findOneByOrFail!.mockResolvedValue(new Employee({}));
      
      // Mock empty work hours
      finalWorkHoursService.getRepository!().findBy.mockResolvedValue([]);
      
      // Act & Assert
      await expect(service.processPayrollForEmployee(employeeId, cutoffId, userId))
        .rejects.toThrow(BadRequestException);
    });

    it('should successfully process payroll for employee', async () => {
      // Arrange
      const employeeId = 'employee-1';
      const cutoffId = 'cutoff-1';
      const userId = 'user-1';
      
      const employee = new Employee({});
      employee.id = employeeId;
      employee.monthlyRate = 30000;
      
      const cutoff = new Cutoff({});
      cutoff.id = cutoffId;
      cutoff.status = CutoffStatus.PENDING;
      cutoff.startDate = new Date('2023-07-01');
      cutoff.endDate = new Date('2023-07-15');
      cutoff.cutoffType = CutoffType.BI_WEEKLY;
      
      const workHours = [
        createFinalWorkHour({ regularDayHours: 8 }),
        createFinalWorkHour({ regularDayHours: 8 })
      ];
      
      // Mock services
      employeesService.findOneByOrFail!.mockResolvedValue(employee);
      cutoffsService.findOneByOrFail!.mockResolvedValue(cutoff);
      finalWorkHoursService.getRepository!().findBy.mockResolvedValue(workHours);
      
      // Mock calculation methods
      jest.spyOn(service, 'calculateBasicPay').mockImplementation((payroll) => {
        payroll.basicPay = 2000;
        payroll.grossPay = 2000;
        payroll.taxableIncome = 2000;
      });
      
      jest.spyOn(service, 'processPayrollItems').mockResolvedValue([]);
      
      // Mock transaction
      dataSource.transaction.mockImplementation(async (callback) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn((entity) => Promise.resolve({...entity, id: 'payroll-1'}))
        };
        return callback(mockManager);
      });
      
      // Act
      const result = await service.processPayrollForEmployee(employeeId, cutoffId, userId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PayrollStatus.APPROVED);
      expect(result.processedAt).toBeDefined();
      expect(result.processedBy).toBe(userId);
      expect(service.calculateBasicPay).toHaveBeenCalled();
      expect(service.processPayrollItems).toHaveBeenCalled();
      expect(finalWorkHoursService.update!).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPayrollDetails', () => {
    it('should return detailed payroll information', async () => {
      // Arrange
      const payrollId = 'payroll-1';
      
      // Create mock payroll with all required properties
      const payroll = new Payroll({});
      payroll.id = payrollId;
      payroll.monthlyRate = 30000;
      payroll.dailyRate = 1363.64;
      payroll.hourlyRate = 170.45;
      payroll.basicPay = 13636;
      payroll.overtimePay = 1000;
      payroll.totalRegularHours = 80;
      payroll.totalOvertimeHours = 5;
      payroll.grossPay = 14636;
      payroll.taxableIncome = 14636;
      payroll.netPay = 12000;
      
      // Mock employee data
      payroll.employee = new Employee({});
      payroll.employee.id = 'employee-1';
      payroll.employee.user = { profile: { firstName: 'John', lastName: 'Doe' } } as User;
      payroll.employee.employeeNumber = 123;
      payroll.employee.roles = [
        createRole({
          id: 'role-1',
          name: 'Manager',
          scope: RoleScopeType.DEPARTMENT,
          department: {
              id: 'dept-1',
              name: 'IT Department',
              alias: 'IT',
              branch: {
                  id: 'branch-1',
                  name: 'Main',
                  alias: 'Main',
                  organization: {
                      id: 'org-1',
                      name: 'Test Organization',
                      alias: 'Test Organization Alias',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      isDeleted: false,
                      hasId: () => true,
                      save: function (options?: SaveOptions): Promise<Organization> {
                          throw new Error("Function not implemented.");
                      },
                      remove: function (options?: RemoveOptions): Promise<Organization> {
                          throw new Error("Function not implemented.");
                      },
                      softRemove: function (options?: SaveOptions): Promise<Organization> {
                          throw new Error("Function not implemented.");
                      },
                      recover: function (options?: SaveOptions): Promise<Organization> {
                          throw new Error("Function not implemented.");
                      },
                      reload: function (): Promise<void> {
                          throw new Error("Function not implemented.");
                      }
                  },
                  isDeleted: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  hasId: () => true,
                  save: function (options?: SaveOptions): Promise<Branch> {
                      throw new Error("Function not implemented.");
                  },
                  remove: function (options?: RemoveOptions): Promise<Branch> {
                      throw new Error("Function not implemented.");
                  },
                  softRemove: function (options?: SaveOptions): Promise<Branch> {
                      throw new Error("Function not implemented.");
                  },
                  recover: function (options?: SaveOptions): Promise<Branch> {
                      throw new Error("Function not implemented.");
                  },
                  reload: function (): Promise<void> {
                      throw new Error("Function not implemented.");
                  }
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              isDeleted: false,
              hasId: function (): boolean {
                  throw new Error("Function not implemented.");
              },
              save: function (options?: SaveOptions): Promise<Department> {
                  throw new Error("Function not implemented.");
              },
              remove: function (options?: RemoveOptions): Promise<Department> {
                  throw new Error("Function not implemented.");
              },
              softRemove: function (options?: SaveOptions): Promise<Department> {
                  throw new Error("Function not implemented.");
              },
              recover: function (options?: SaveOptions): Promise<Department> {
                  throw new Error("Function not implemented.");
              },
              reload: function (): Promise<void> {
                  throw new Error("Function not implemented.");
              }
          }
        })
      ];
      
      // Mock cutoff data
      payroll.cutoff = new Cutoff({});
      payroll.cutoff.id = 'cutoff-1';
      payroll.cutoff.startDate = new Date('2023-07-01');
      payroll.cutoff.endDate = new Date('2023-07-15');
      payroll.cutoff.cutoffType = CutoffType.BI_WEEKLY;
      
      // Mock payroll items for government contributions
      payroll.payrollItems = [
        createPayrollItem({
          id: 'item-1',
          payrollItemType: createPayrollItemType({
            name: 'SSS Contribution',
            category: PayrollItemCategory.GOVERNMENT,
            governmentContributionType: 'SSS',
            isGovernmentMandated: true
          }),
          amount: 1125,
          employerAmount: 2250
        }),
        createPayrollItem({
          id: 'item-2',
          payrollItemType: createPayrollItemType({
            name: 'PhilHealth Contribution',
            category: PayrollItemCategory.GOVERNMENT,
            governmentContributionType: 'PHILHEALTH',
            isGovernmentMandated: true
          }),
          amount: 450,
          employerAmount: 450
        })
      ];
      
      // Mock the getContributionByType method
      payroll.getContributionByType = (type: string) => {
        if (type === 'sss') {
          return { employee: 1125, employer: 2250, total: 3375 };
        } else if (type === 'philhealth') {
          return { employee: 450, employer: 450, total: 900 };
        } else if (type === 'pagibig') {
          return { employee: 100, employer: 100, total: 200 };
        } else {
          return { employee: 0, employer: 0, total: 0 };
        }
      };
      
      // Mock findOneByOrFail to return our prepared payroll
      jest.spyOn(service, 'findOneByOrFail').mockResolvedValue(payroll);
      
      // Act
      const result = await service.getPayrollDetails(payrollId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.payrollId).toBe(payrollId);
      expect(result.employee.name).toBe('John Doe');
      expect(result.employee.position).toBe('IT Department Manager');
      expect(result.cutoff.period).toContain('2023-07-01');
      expect(result.rates.monthly).toBe(30000);
      expect(result.workHours.regular).toBe(80);
      expect(result.earnings.basicPay).toBe(13636);
      expect(result.deductions.governmentContributions.sss.employee).toBe(1125);
      expect(result.deductions.governmentContributions.philhealth.employee).toBe(450);
      expect(result.totals.netPay).toBe(12000);
    });
  });
});

// Helper functions to create test entities
function createFinalWorkHour(data: Partial<FinalWorkHour> = {}): FinalWorkHour {
  const workHour = new FinalWorkHour({});
  Object.assign(workHour, {
    id: 'work-hour-' + Math.random().toString(36).substring(7),
    timeIn: new Date(),
    timeOut: new Date(),
    workDate: new Date(),
    dayType: DayType.REGULAR_DAY,
    regularDayHours: 0,
    restDayHours: 0,
    specialHolidayHours: 0,
    regularHolidayHours: 0,
    overtimeRegularDayHours: 0,
    overtimeRestDayHours: 0,
    overtimeSpecialHolidayHours: 0,
    overtimeRegularHolidayHours: 0,
    nightDifferentialHours: 0,
    isApproved: true,
    isProcessed: false,
    ...data
  });
  return workHour;
}

function createPayrollItemType(data: Partial<PayrollItemType> = {}): PayrollItemType {
  const itemType = new PayrollItemType({});
  Object.assign(itemType, {
    id: 'item-type-' + Math.random().toString(36).substring(7),
    name: 'Test Item Type',
    category: PayrollItemCategory.OTHER,
    defaultOccurrence: 'MONTHLY',
    unit: 'PHP',
    computationFormula: 'return 0;',
    isActive: true,
    isSystemGenerated: false,
    isGovernmentMandated: false,
    hasEmployerShare: false,
    isPartOfTaxCalculation: false,
    isTaxable: true,
    isTaxDeductible: false,
    isDisplayedInPayslip: true,
    isRequired: false,
    ...data
  });
  return itemType;
}

function createPayrollItem(data: Partial<PayrollItem> = {}): PayrollItem {
  const item = new PayrollItem({});
  Object.assign(item, {
    id: 'item-' + Math.random().toString(36).substring(7),
    amount: 0,
    occurrence: 'MONTHLY',
    isActive: true,
    isTaxable: true,
    ...data
  });
  return item;
}

function createRole(data: Partial<Role> = {}): Role {
  const role = new Role({});
  Object.assign(role, {
    id: 'role-' + Math.random().toString(36).substring(7),
    name: 'Test Role',
    scope: RoleScopeType.DEPARTMENT,
    ...data
  });
  return role;
}