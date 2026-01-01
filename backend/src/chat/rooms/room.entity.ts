import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isPrivate: boolean;

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable()
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}
