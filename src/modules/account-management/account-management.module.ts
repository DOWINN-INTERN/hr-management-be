import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { EmployeeManagementModule } from '../employee-management/employee-management.module';
import { RolesModule } from '../employee-management/roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UserSeederService } from './services/user-seeder.service';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';

@Module({
imports: [
        ConfigModule,
        RolesModule,
        UsersModule,
        AuthModule,
        SessionsModule,
        ProfilesModule,
        EmployeeManagementModule,
        RouterModule.register([
            {
                path: 'account',
                module: AccountManagementModule,
                children: [
                    { path: 'auth', module: AuthModule },
                    { path: 'users', module: UsersModule },
                    { 
                        path: 'profiles', 
                        module: ProfilesModule
                    },
                    { path: 'sessions', module: SessionsModule },
                ],
            },
        ]),
    ],
    providers: [UserSeederService],
    exports: [
        UsersModule,
        AuthModule,
        SessionsModule,
        ProfilesModule
    ]
})
export class AccountManagementModule {}
