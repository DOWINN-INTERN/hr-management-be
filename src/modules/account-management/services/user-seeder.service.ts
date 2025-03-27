import { EmploymentCondition } from '@/common/enums/employment/employment-condition.enum';
import { EmploymentStatus } from '@/common/enums/employment/employment-status.enum';
import { EmploymentType } from '@/common/enums/employment/employment-type.enum';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { Role } from '@/common/enums/role.enum';
import { AuthService } from '@/modules/account-management/auth/auth.service';
import { LoginUserDto } from '@/modules/account-management/auth/dto/login-user.dto';
import { EmployeesService } from '@/modules/employee-management/employees.service';
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
    
    // Check if super admin role exists
    let superAdminRole = await this.rolesService.findOneBy({ name: Role.SUPERADMIN });

    // Check if employee role exists
    let employeeRole = await this.rolesService.findOneBy({ name: Role.EMPLOYEE });

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

    // find the employee with the super admin role
    let superAdminEmployee = await this.employeesService.include(e => e.roles).where(e => e.roles?.some(r => r.id === superAdminRole.id) ?? false).firstOrDefault();
    
    // log super admin employee
    console.log(JSON.stringify(superAdminEmployee, null, 2));

    if (superAdminEmployee) {
      this.logger.log('Super admin employee already exists');
    }
    else {
      // find the user with the employee number SA-001
      superAdminEmployee = await this.employeesService.findOneBy({ employeeNumber: 'SA-001' });

      if (superAdminEmployee) {
        this.logger.warn('Super admin employee exists but is not associated with the super admin role');
        superAdminEmployee.roles = [superAdminRole, employeeRole];
        await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
        this.logger.log('Super admin employee associated with the super admin role successfully');
      }
      else {
        this.logger.log('Creating super admin employee...');
        superAdminEmployee = await this.employeesService.create({
            employeeNumber: 'SA-001',
            employmentStatus: EmploymentStatus.ACTIVE,
            employmentCondition: EmploymentCondition.REGULAR,
            employmentType: EmploymentType.FULL_TIME,
            commencementDate: new Date(),
            roles: [superAdminRole, employeeRole],
        });
        this.logger.log('Super admin employee created successfully');
      }
    }

    // Check if super admin user exists
    let superAdminExists = await this.usersService.include(u => u.employee).where(u => u.employee?.id === superAdminEmployee.id).firstOrDefault();

    if (!superAdminExists) {

      // Check if super admin user exists with the super admin email
      superAdminExists = await this.usersService.findOneBy({ email: superAdminEmail });

      if (superAdminExists) {
        this.logger.warn('Super admin user exists but is not associated with the super admin employee');
        superAdminExists.employee = superAdminEmployee;
        await this.usersService.update(superAdminExists.id, superAdminExists);
        this.logger.log('Super admin user associated with the super admin employee successfully');
      }
      else {
        this.logger.log('Creating super admin user...');

        // create super admin user
        superAdminExists = await this.usersService.create({
          email: superAdminEmail,
          password: await bcrypt.hash(superAdminPassword, 10),
          userName: superAdminEmail,
          employee: superAdminEmployee
        });

        // update super admin employee with the super admin user
        superAdminEmployee.user = superAdminExists;
        await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
        this.logger.log('Super admin user created successfully');
      }

    } else {
      this.logger.log('Super admin user already exists');
      
      // Check if super admin email is the same as the one in the config
      if (superAdminExists.email !== superAdminEmail) {
        this.logger.warn('Super admin email is different from the one in the config');

        // Update super admin email to the one in the config
        superAdminExists.email = superAdminEmail;
        await this.usersService.update(superAdminExists.id, superAdminExists);
        this.logger.log('Super admin email updated successfully');
      }

      // check if password is the same as the one in the config
      var loginCredentials: LoginUserDto = {
        emailOrUserName: superAdminExists.email ?? "",
        password: superAdminPassword
      }

      if (await this.authService.validateUser(loginCredentials)) {
        this.logger.log('Super admin password is the same as the one in the config');
      }
      else
      {
        this.logger.warn('Super admin password is different from the one in the config');

        // Update super admin password to the one in the config
        superAdminExists.password = await bcrypt.hash(superAdminPassword, 10);
        await this.usersService.update(superAdminExists.id, superAdminExists);
        this.logger.log('Super admin password updated successfully');
      }
    }
  }
}