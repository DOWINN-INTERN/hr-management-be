import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('<%= dasherize(entityName) %>s')
export class <%= classify(entityName) %> extends BaseEntity<<%= classify(entityName) %>> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}