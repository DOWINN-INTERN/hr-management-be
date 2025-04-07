import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { BaseService } from '../services/base.service';
import { BaseController } from './base.controller';

// Import services using relative paths to avoid import issues
import { APP_GUARD, Reflector } from '@nestjs/core';
import { User } from '../../modules/account-management/users/entities/user.entity';
import { UsersService } from '../../modules/account-management/users/users.service';
import { EmployeesService } from '../../modules/employee-management/employees.service';
import { Employee } from '../../modules/employee-management/entities/employee.entity';
import { Role } from '../../modules/employee-management/roles/entities/role.entity';
import { RolesService } from '../../modules/employee-management/roles/roles.service';

// Create a test entity class extending BaseEntity
class TestEntity extends BaseEntity<TestEntity> {
    name!: string;
    email!: string;
    age!: number;
}

// Create a test DTO class for transformation
class TestDto {
    id!: string;
    name!: string;
    email!: string;
    age!: number;
}

// Create a test service extending BaseService
class TestService extends BaseService<TestEntity> {
    constructor(repository: Repository<TestEntity>, usersService: UsersService) {
        super(repository, usersService);
    }
}

// Create a concrete implementation of BaseController for testing
class TestController extends BaseController<TestEntity, TestDto, TestDto, TestDto> {
    constructor(baseService: TestService) {
        super(baseService, TestDto, 'Test Entity');
    }
}

describe('BaseController', () => {
    let controller: TestController;
    let service: TestService;
    let repository: Repository<TestEntity>;

    // Create mock repositories
    const mockTestRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        findAndCount: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
            getOne: jest.fn(),
        }),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        }),
    };

    const mockEmployeeRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        }),
    };

    const mockRoleRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        }),
    };

    // Mock the guard
    const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

    beforeEach(async () => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
            providers: [
                // Provide the test service
                TestService,
                // Provide dependent services
                UsersService,
                EmployeesService,
                RolesService,
                // Provide repositories
                {
                    provide: getRepositoryToken(TestEntity),
                    useValue: mockTestRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Employee),
                    useValue: mockEmployeeRepository,
                },
                {
                    provide: getRepositoryToken(Role),
                    useValue: mockRoleRepository,
                },
                // Provide Reflector for guards
                {
                    provide: Reflector,
                    useValue: { get: jest.fn() },
                },
            ],
        })
        // Override guards to avoid authorization issues in tests
        .overrideGuard(APP_GUARD)
        .useValue(mockGuard)
        .compile();

        // Get instances of controller and service
        controller = module.get<TestController>(TestController);
        service = module.get<TestService>(TestService);
        repository = module.get<Repository<TestEntity>>(getRepositoryToken(TestEntity));

        // Create spies on service methods
        jest.spyOn(service, 'findAllComplex');
        jest.spyOn(service, 'findOneByOrFail');
        jest.spyOn(service, 'create');
        jest.spyOn(service, 'update');
        jest.spyOn(service, 'delete');
        jest.spyOn(service, 'deleteMany');
    });

    describe('findAllAdvanced', () => {
        it('should return paginated data transformed to DTOs', async () => {
            // Arrange
            const testEntities = [
                { id: '1', name: 'Test User 1', email: 'user1@example.com', age: 25 },
                { id: '2', name: 'Test User 2', email: 'user2@example.com', age: 30 },
            ];
            
            const paginationMeta = new PaginationDto();
            paginationMeta.skip = 0;
            paginationMeta.take = 10;
            
            const mockResult: PaginatedResponseDto<TestEntity> = {
                data: testEntities as TestEntity[],
                totalCount: testEntities.length,
                meta: paginationMeta
            };
            
            // Mock the service method
            (service.findAllComplex as jest.Mock).mockResolvedValue(mockResult);
            
            const paginationDto = new PaginationDto<TestEntity>();
            paginationDto.skip = 0;
            paginationDto.take = 10;
            
            // Act
            const result = await controller.findAllAdvanced(paginationDto);
            
            // Assert
            expect(service.findAllComplex).toHaveBeenCalledWith(paginationDto);
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('totalCount', 2);
            expect(result).toHaveProperty('meta');
            expect(result.data).toHaveLength(2);
            
            // Verify proper transformation of entities to DTOs
            expect(result.data).toEqual(plainToInstance(TestDto, testEntities));
            
            // Check that data structure matches expected DTO
            expect(result.data[0]).toHaveProperty('id', '1');
            expect(result.data[0]).toHaveProperty('name', 'Test User 1');
            expect(result.data[0]).toHaveProperty('email', 'user1@example.com');
            expect(result.data[0]).toHaveProperty('age', 25);
        });

        it('should handle empty result sets', async () => {
            // Arrange
            const paginationMeta = new PaginationDto();
            paginationMeta.skip = 0;
            paginationMeta.take = 10;
            
            const mockResult: PaginatedResponseDto<TestEntity> = {
                data: [],
                totalCount: 0,
                meta: paginationMeta
            };
            
            (service.findAllComplex as jest.Mock).mockResolvedValue(mockResult);
            
            const paginationDto = new PaginationDto<TestEntity>();
            
            // Act
            const result = await controller.findAllAdvanced(paginationDto);
            
            // Assert
            expect(service.findAllComplex).toHaveBeenCalledWith(paginationDto);
            expect(result.data).toEqual([]);
            expect(result.totalCount).toBe(0);
            expect(result.meta).toEqual(paginationMeta);
        });

        it('should correctly process complex filter criteria', async () => {
            // Arrange
            const testEntities = [
                { id: '1', name: 'Test User 1', email: 'user1@example.com', age: 25 },
            ];
            
            const paginationMeta = new PaginationDto();
            paginationMeta.skip = 0;
            paginationMeta.take = 10;
            
            const mockResult: PaginatedResponseDto<TestEntity> = {
                data: testEntities as TestEntity[],
                totalCount: 1,
                meta: paginationMeta
            };
            
            (service.findAllComplex as jest.Mock).mockResolvedValue(mockResult);
            
            const paginationDto = new PaginationDto<TestEntity>();
            paginationDto.filter = JSON.stringify({ 
                age: { gte: 20 },
                name: { ilike: 'user' } 
            });
            paginationDto.sort = JSON.stringify({ age: 'ASC' });
            
            // Act
            const result = await controller.findAllAdvanced(paginationDto);
            
            // Assert
            expect(service.findAllComplex).toHaveBeenCalledWith(paginationDto);
            expect(result.data).toHaveLength(1);
            expect(result.totalCount).toBe(1);
        });

        it('should preserve pagination metadata in the response', async () => {
            // Arrange
            const paginationMeta = new PaginationDto<TestEntity>();
            paginationMeta.skip = 10;
            paginationMeta.take = 5;
            paginationMeta.filter = { age: { gte: 21 } };
            paginationMeta.sort = { name: 'ASC' };
            
            const mockResult: PaginatedResponseDto<TestEntity> = {
                data: [] as TestEntity[],
                totalCount: 100, // Total count larger than the page size
                meta: paginationMeta
            };
            
            (service.findAllComplex as jest.Mock).mockResolvedValue(mockResult);
            
            // Act
            const result = await controller.findAllAdvanced(paginationMeta);
            
            // Assert
            expect(result.meta).toEqual(paginationMeta);
            expect(result.meta.skip).toBe(10);
            expect(result.meta.take).toBe(5);
            expect(result.totalCount).toBe(100);
        });
    });

    describe('findOne', () => {
        it('should find entity by field criteria and transform it to DTO', async () => {
            // Arrange
            const testEntity = { 
                id: '1', 
                name: 'Test User', 
                email: 'test@example.com', 
                age: 25 
            } as TestEntity;
            
            (service.findOneByOrFail as jest.Mock).mockResolvedValue(testEntity);
            
            // Act
            const result = await controller.findOne('email:test@example.com');
            
            // Assert
            expect(service.findOneByOrFail).toHaveBeenCalledWith(
                { email: 'test@example.com' },
                expect.any(Object)
            );
            expect(result).toEqual(plainToInstance(TestDto, testEntity));
        });

        it('should handle multiple field criteria', async () => {
            // Arrange
            const testEntity = { 
                id: '1', 
                name: 'Test User', 
                email: 'test@example.com', 
                age: 30 
            } as TestEntity;
            
            (service.findOneByOrFail as jest.Mock).mockResolvedValue(testEntity);
            
            // Act
            const result = await controller.findOne('name:Test User,age:30');
            
            // Assert
            expect(service.findOneByOrFail).toHaveBeenCalledWith(
                { name: 'Test User', age: 30 },
                expect.any(Object)
            );
        });

        it('should properly handle type conversions in query params', async () => {
            // Arrange
            const testEntity = { 
                id: '1', 
                name: 'Test User', 
                email: 'test@example.com', 
                age: 25,
                isActive: true
            } as any;
            
            (service.findOneByOrFail as jest.Mock).mockResolvedValue(testEntity);
            
            // Act
            const result = await controller.findOne('age:25,isActive:true');
            
            // Assert
            expect(service.findOneByOrFail).toHaveBeenCalledWith(
                { age: 25, isActive: true },
                expect.any(Object)
            );
        });

        it('should throw NotFoundException when entity is not found', async () => {
            // Arrange
            (service.findOneByOrFail as jest.Mock).mockRejectedValue(new NotFoundException());
            
            // Act & Assert
            await expect(controller.findOne('id:999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and return a new entity as DTO', async () => {
            // Arrange
            const createDto = { name: 'New User', email: 'new@example.com', age: 28 };
            const createdEntity = { 
                id: '1', 
                ...createDto, 
                createdAt: new Date(),
                updatedAt: new Date()
            } as TestEntity;
            
            (service.create as jest.Mock).mockResolvedValue(createdEntity);
            
            // Act
            const result = await controller.create(createDto as any, 'user-id');
            
            // Assert
            expect(service.create).toHaveBeenCalledWith(createDto, 'user-id');
            expect(result).toEqual(plainToInstance(TestDto, createdEntity));
        });
    });

    describe('update', () => {
        it('should update and return the updated entity as DTO', async () => {
            // Arrange
            const updateDto = { name: 'Updated User' };
            const updatedEntity = { 
                id: '1', 
                name: 'Updated User',
                email: 'test@example.com',
                age: 25,
                updatedAt: new Date()
            } as TestEntity;
            
            (service.update as jest.Mock).mockResolvedValue(updatedEntity);
            
            // Act
            const result = await controller.update('1', updateDto as any, 'user-id');
            
            // Assert
            expect(service.update).toHaveBeenCalledWith('1', updateDto, 'user-id');
            expect(result).toEqual(plainToInstance(TestDto, updatedEntity));
        });
    });

    describe('delete', () => {
        it('should call service.delete with correct id', async () => {
            // Act
            await controller.delete('1');
            
            // Assert
            expect(service.delete).toHaveBeenCalledWith('1');
        });
    });

    describe('deleteMany', () => {
        it('should call service.deleteMany with correct ids and hardDelete flag', async () => {
            // Arrange
            const ids = ['1', '2', '3'];
            
            // Act
            await controller.deleteMany(ids, true);
            
            // Assert
            expect(service.deleteMany).toHaveBeenCalledWith(ids, true);
        });
        
        it('should default hardDelete to false if not specified', async () => {
            // Arrange
            const ids = ['1', '2', '3'];
            
            // Act
            await controller.deleteMany(ids);
            
            // Assert
            expect(service.deleteMany).toHaveBeenCalledWith(ids, false);
        });
    });
});