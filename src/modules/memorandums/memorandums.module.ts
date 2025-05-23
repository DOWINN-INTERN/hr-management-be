import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { MemorandumFlowsModule } from './memorandum-flows/memorandum-flows.module';
import { MemorandumRecipientsModule } from './memorandum-recipients/memorandum-recipients.module';
import { MemorandumTemplatesModule } from './memorandum-templates/memorandum-templates.module';
import { MemorandumsController } from './memorandums.controller';
import { MemorandumsService } from './memorandums.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Memorandum]),
        RouterModule.register([
            {
                  path: 'memorandums',
                  module: MemorandumsModule,
                  children: [
                    {
                        path: 'templates',
                        module: MemorandumTemplatesModule
                    },
                    {
                        path: 'flows',
                        module: MemorandumFlowsModule
                    },
                    {
                        path: 'recipients',
                        module: MemorandumRecipientsModule
                    }
                  ]
              }
        ]),
        MemorandumTemplatesModule,
        MemorandumFlowsModule,
        MemorandumRecipientsModule,
    ],
    providers: [MemorandumsService],
    exports: [
        MemorandumsService,
        MemorandumTemplatesModule,
        MemorandumFlowsModule,
        MemorandumRecipientsModule,
    ],
    controllers: [MemorandumsController],
})
export class MemorandumsModule {}