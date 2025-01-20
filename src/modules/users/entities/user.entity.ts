import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'uuid', description: 'The unique identifier of the user' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @Column()
  @ApiProperty({ example: 'hashedpassword', description: 'The hashed password of the user' })
  password: string;

  @Column({ default: 'user' })
  @ApiProperty({ example: 'user', description: 'The role of the user' })
  role: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'google', description: 'The provider of the user' })
  provider?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'googleId', description: 'The provider ID of the user' })
  providerId?: string;
}
