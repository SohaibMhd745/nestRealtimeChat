import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Room } from '../chat/rooms/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: '#000000' })
  color: string;

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];
}
