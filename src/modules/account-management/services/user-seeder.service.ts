import { EmploymentCondition } from '@/common/enums/employment/employment-condition.enum';
import { EmploymentStatus } from '@/common/enums/employment/employment-status.enum';
import { EmploymentType } from '@/common/enums/employment/employment-type.enum';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { Role } from '@/common/enums/role.enum';
import { AuthService } from '@/modules/account-management/auth/auth.service';
import { LoginUserDto } from '@/modules/account-management/auth/dto/login-user.dto';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { RolesService } from '@/modules/employee-management/roles/roles.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserSeederService implements OnModuleInit {
  private readonly logger = new Logger(UserSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
    private readonly employeesService: EmployeesService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    const superAdminEmail = this.configService.getOrThrow('SUPER_ADMIN_EMAIL');
    const superAdminPassword = this.configService.getOrThrow('SUPER_ADMIN_PASSWORD');
    this.logger.log('Checking if super admin role exists...');
    
    const superAdminRole = await this.seedSuperAdminRole();
    const employeeRole = await this.seedEmployeeRole();
    let superAdminEmployee = await this.seedSuperAdminEmployee();

    // check if super admin employee has the super admin and employee role
    const hasSuperAdminAndEmployeeRole = 
      superAdminEmployee.roles?.some(role => role.name === Role.SUPERADMIN) && 
      superAdminEmployee.roles?.some(role => role.name === Role.EMPLOYEE);

    if (!hasSuperAdminAndEmployeeRole) {
      this.logger.warn('Super admin employee does not have the super admin and employee role');
      superAdminEmployee.roles = [superAdminRole, employeeRole];
      await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
      this.logger.log('Super admin employee associated with the super admin and employee role successfully');
    } else {
      this.logger.log('Super admin employee already has the super admin and employee role');
    }

    // Check if super admin user exists
    let superAdminUser = await this.usersService.findOneBy(
      { employee: { id: superAdminEmployee.id } as Employee },
      { relations: { employee: true } }
    );
    
    if (!superAdminUser) {

      // Check if super admin user exists with the super admin email
      superAdminUser = await this.usersService.findOneBy({ email: superAdminEmail });

      if (superAdminUser) {
        this.logger.warn('Super admin user exists but is not associated with the super admin employee');
        superAdminEmployee.user = superAdminUser;
      }
      else {
        this.logger.log('Creating super admin user...');

        // create super admin user
        superAdminUser = await this.usersService.create({
          email: superAdminEmail,
          password: await bcrypt.hash(superAdminPassword, 10),
          userName: superAdminEmail,
          employee: superAdminEmployee
        });
        this.logger.log('Super admin user created successfully');
      }
    } else {
      // Check if super admin email is the same as the one in the config
      if (superAdminUser.email !== superAdminEmail) {
        // log super admin email
        this.logger.log('Super admin email is different from the one in the config');
        this.logger.log('Super admin user exists with email or username: ' + superAdminUser.email);
        this.logger.log('Super admin email: ' + superAdminEmail);
        this.logger.warn('Super admin email is different from the one in the config');

        // Update super admin email to the one in the config
        superAdminUser.email = superAdminEmail;
        superAdminUser.userName = superAdminEmail;
        await this.usersService.update(superAdminUser.id, superAdminUser);
        this.logger.log('Super admin email updated successfully');
      }

      // log super admin exist email
      this.logger.log('Super admin user exists with email or username: ' + superAdminUser.email);

      // check if password is the same as the one in the config
      var loginCredentials: LoginUserDto = {
        emailOrUserName: superAdminUser.email ?? "",
        password: superAdminPassword
      }

      if (await this.authService.validateUser(loginCredentials)) {
        this.logger.log('Super admin password is the same as the one in the config');
      }
      else
      {
        this.logger.warn('Super admin password is different from the one in the config');

        // Update super admin password to the one in the config
        superAdminUser.password = await bcrypt.hash(superAdminPassword, 10);
        await this.usersService.update(superAdminUser.id, superAdminUser);
        this.logger.log('Super admin password updated successfully');
      }
    }

    // check if superAdminUser is associated with the super admin employee
    if (superAdminUser.employee?.id !== superAdminEmployee.id) {
      this.logger.warn('Super admin user is not associated with the super admin employee');
      superAdminUser.employee = superAdminEmployee;
      await this.usersService.update(superAdminUser.id, superAdminUser);
      this.logger.log('Super admin user associated with the super admin employee successfully');
    }
  }

  async seedSuperAdminRole() {
    // Check if super admin role exists
    let superAdminRole = await this.rolesService.findOneBy({ name: Role.SUPERADMIN });
    // Create super admin role if it doesn't exist
    if (!superAdminRole) {
      this.logger.log('Creating SuperAdmin role...');
      superAdminRole = await this.rolesService.create({
        name: Role.SUPERADMIN,
        description: 'Super Admin Role',
        scope: RoleScopeType.GLOBAL,
      });
      this.logger.log('SuperAdmin role created successfully');
    } else {
      this.logger.log('SuperAdmin role already exists');
    }

    return superAdminRole;
  }

  async seedEmployeeRole() {
    // Check if employee role exists
    let employeeRole = await this.rolesService.findOneBy({ name: Role.EMPLOYEE });

    // Create employee role if it doesn't exist
    if (!employeeRole) {
      this.logger.log('Creating Employee role...');
      employeeRole = await this.rolesService.create({
        name: Role.EMPLOYEE,
        description: 'Employee Role',
        scope: RoleScopeType.OWNED,
      });
      this.logger.log('Employee role created successfully');
    } else {
      this.logger.log('Employee role already exists');
    }

    return employeeRole;
  }

  async seedSuperAdminEmployee() {
    // Check if super admin employee exists
    let superAdminEmployee = await this.employeesService.findOneBy({ employeeNumber: 'SA-001' }, { relations: { roles: true } });

    // Create super admin employee if it doesn't exist
    if (!superAdminEmployee) {
      this.logger.log('Creating SuperAdmin employee...');
      superAdminEmployee = await this.employeesService.create({
        employeeNumber: 'SA-001',
        employmentStatus: EmploymentStatus.ACTIVE,
        employmentCondition: EmploymentCondition.REGULAR,
        employmentType: EmploymentType.FULL_TIME,
        commencementDate: new Date(),
      });
      this.logger.log('SuperAdmin employee created successfully');
    } else {
      this.logger.log('SuperAdmin employee already exists');
    }

    return superAdminEmployee;
  }
}