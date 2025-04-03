import { BaseEntity } from "@/database/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Document } from "../../entities/document.entity";

@Entity('document_types')
export class DocumentType extends BaseEntity<DocumentType> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: false })
    active: boolean = false;

    @Column({ default: true })
    requiredForApplicants: boolean = true;

    @Column({ default: true })
    requiredForEmployees: boolean = true;

    @ManyToOne(() => DocumentType, (parent) => parent.children, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parentDocumentTypeId' })
    parent?: DocumentType;

    @OneToMany(() => DocumentType, (child) => child.parent, { nullable: true })
    children?: DocumentType[];

    @OneToMany(() => Document, (document: Document) => document.documentType)
    documents?: Document[];
}