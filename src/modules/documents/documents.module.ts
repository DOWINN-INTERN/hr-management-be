import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypesModule } from './document-types/document-types.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Document]), DocumentTypesModule,
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
