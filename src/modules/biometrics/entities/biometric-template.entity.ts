import { BaseEntity } from "@/database/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity('biometric_templates')
export class BiometricTemplate extends BaseEntity<BiometricTemplate> {
  @Column()
  userId!: string;

  @Column()
  fingerId!: number;

  @Column({ type: 'longblob' })
  template!: Buffer;

  @Column()
  provider!: string;
}