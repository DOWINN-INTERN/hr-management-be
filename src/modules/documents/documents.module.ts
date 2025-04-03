import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../account-management/users/users.module';
import { DocumentTypesModule } from './document-types/document-types.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Document]), UsersModule, DocumentTypesModule,
    RouterModule.register([
            {
                path: 'documents',
                module: DocumentsModule,
                children: [
                    {
                        path: 'types',
                        module: DocumentTypesModule,
                    }
                ]
            },
        ]),
    ],
    providers: [DocumentsService],
    exports: [DocumentsService, DocumentTypesModule],
    controllers: [DocumentsController],
})
export class DocumentsModule {}
