import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Policy]),
    ],
    providers: [PoliciesService],
    exports: [PoliciesService],
    controllers: [PoliciesController],
})
export class PoliciesModule {}