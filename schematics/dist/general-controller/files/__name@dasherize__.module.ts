import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { <%= classify(moduleName) %>Controller } from './<%= dasherize(moduleName) %>.controller';
import { <%= classify(moduleName) %>Service } from './<%= dasherize(moduleName) %>.service';
import { <%= classify(entityName) %> } from './entities/<%= dasherize(entityName) %>.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([<%= classify(entityName) %>]),
        UsersModule,
<% if (!name.includes('/')) { %>
        RouterModule.register([
            {
                path: '<%= dasherize(moduleName) %>',
                module: <%= classify(moduleName) %>Module,
            },
        ]),
<% } %>
    ],
    providers: [<%= classify(moduleName) %>Service],
    exports: [<%= classify(moduleName) %>Service],
    controllers: [<%= classify(moduleName) %>Controller],
})
export class <%= classify(moduleName) %>Module {}