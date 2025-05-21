import { BaseEntity } from "@/database/entities/base.entity";
import { User } from "@/modules/account-management/users/entities/user.entity";
import { WorkTimeRequest } from "@/modules/attendance-management/work-time-requests/entities/work-time-request.entity";
import { ScheduleChangeRequest } from "@/modules/shift-management/schedules/schedule-change-requests/entities/schedule-change-request.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DocumentType } from "../document-types/entities/document-type.entity";

@Entity('documents')
export class Document extends BaseEntity<Document> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    fileKey!: string;

    @Column()
    size!: number;

    @Column()
    mimeType!: string;

    @ManyToOne(() => User, (user: User) => user.documents, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ManyToOne(() => DocumentType, (doctype: DocumentType) => doctype.documents)
    @JoinColumn({ name: 'documentTypeId' })
    documentType!: DocumentType;

    @ManyToOne(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.documents, { nullable: true })
    @JoinColumn({ name: 'scheduleChangeRequestId' })
    scheduleChangeRequest?: ScheduleChangeRequest;

    @ManyToOne(() => WorkTimeRequest, (workTimeRequest: WorkTimeRequest) => workTimeRequest.documents, { nullable: true })
    @JoinColumn({ name: 'workTimeRequestId' })
    workTimeRequest?: WorkTimeRequest;
}