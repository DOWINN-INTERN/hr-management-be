import { BaseController } from '@/common/controllers/base.controller';
import {
    Controller
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetSessionDto, SessionDto } from './dtos/session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@Controller()
export class SessionsController extends BaseController<Session, SessionDto> {
    constructor(private readonly sessionsService: SessionsService) {
        super(sessionsService, GetSessionDto);
    }
}
