import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { createController } from '@/common/factories/create-controller.factory';
import { GetSessionDto, UpdateSessionDto } from './dtos/session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

export class SessionsController extends createController(Session, SessionsService, GetSessionDto, undefined, UpdateSessionDto)
{
    override async create(entityDto: any, createdById: string): Promise<GetSessionDto> {
        return await super.create(entityDto, createdById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }
}