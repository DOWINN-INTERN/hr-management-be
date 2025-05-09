import { DeepPartial, Repository } from 'typeorm';
import { BaseEntity } from '../../src/database/entities/base.entity';

export abstract class BaseFactory<T extends BaseEntity<T>> {
  constructor(protected repository: Repository<T>) {}

  abstract makePlain(overrides?: DeepPartial<T>): DeepPartial<T>;

  generateEntity(overrides?: DeepPartial<T>): T {
    const plainEntity = this.makePlain(overrides);
    // First create an empty instance through repository
    const entity = this.repository.create();
    // Then apply properties
    Object.assign(entity, plainEntity);
    return entity;
  }

  async createOne(overrides?: DeepPartial<T>): Promise<T> {
    const entity = this.generateEntity(overrides);
    return this.repository.save(entity);
  }

  async createMany(count: number = 1, overrides?: DeepPartial<T>): Promise<T[]> {
    const entities: T[] = [];
    
    for (let i = 0; i < count; i++) {
      const entity = this.generateEntity(overrides);
      entities.push(entity);
    }
    
    return this.repository.save(entities);
  }
}