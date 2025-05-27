import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompliancesController } from './compliances.controller';
import { CompliancesService } from './compliances.service';
import { Compliance } from './entities/compliance.entity';
import { MemorandumFlowsModule } from './memorandums/memorandum-flows/memorandum-flows.module';
import { MemorandumRecipientsModule } from './memorandums/memorandum-recipients/memorandum-recipients.module';
import { MemorandumTemplatesModule } from './memorandums/memorandum-templates/memorandum-templates.module';
import { MemorandumsModule } from './memorandums/memorandums.module';
import { PoliciesModule } from './policies/policies.module';
import { RulesModule } from './rules/rules.module';
import { ViolationsModule } from './violations/violations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Compliance]),

        RouterModule.register([
            {
                path: 'compliances',
                module: ComplianceManagementModule,
                children: [
                    {
                        path: 'memorandums',
                        module: MemorandumsModule,
                        children: [
                            {
                                path: 'flows',
                                module: MemorandumFlowsModule,
                            },
                            {
                                path: 'templates',
                                module: MemorandumTemplatesModule
                            },
                            {
                                path: 'recipients',
                                module: MemorandumRecipientsModule
                            }
                        ]
                    },
                    // {
                    //     path: 'policies',
                    //     module: PoliciesModule
                    // },
                    // {
                    //     path: 'rules',
                    //     module: RulesModule
                    // },
                    // {
                    //     path: 'violations',
                    //     module: ViolationsModule
                    // }
                ]
            },
        ]),
        MemorandumsModule,
        MemorandumFlowsModule,
        MemorandumTemplatesModule,
        MemorandumRecipientsModule,
        PoliciesModule,
        RulesModule,
        ViolationsModule,
    ],
    providers: [CompliancesService],
    exports: [CompliancesService,
        MemorandumsModule,
        MemorandumFlowsModule,
        MemorandumTemplatesModule,
        MemorandumRecipientsModule,
        PoliciesModule,
        RulesModule,
        ViolationsModule,
    ],
    controllers: [CompliancesController],
})
export class ComplianceManagementModule {}