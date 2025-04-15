import { BaseEntity } from "@/database/entities/base.entity";
import { User } from "@/modules/account-management/users/entities/user.entity";
import { ScheduleChangeRequest } from "@/modules/schedule-management/schedule-change-requests/entities/schedule-change-request.entity";
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

    @ManyToOne(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.documents)
    @JoinColumn({ name: 'scheduleChangeRequestId' })
    scheduleChangeRequest?: ScheduleChangeRequest;
}