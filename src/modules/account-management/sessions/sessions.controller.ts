import { createController } from '@/common/factories/create-controller.factory';
import { GetSessionDto, SessionDto, UpdateSessionDto } from './dtos/session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

export class SessionsController extends createController<
    Session,
    GetSessionDto,
    SessionDto,
    UpdateSessionDto
>(
    'Sessions',       // Entity name for Swagger documentation
    SessionsService, // The service handling Session-related operations
    GetSessionDto,  // DTO for retrieving Sessions
    SessionDto,     // DTO for creating Sessions
    UpdateSessionDto // DTO for updating Sessions
) {
    override async create(entityDto: SessionDto, createdById: string): Promise<GetSessionDto> {
        return await super.create(entityDto, createdById);
    }
}