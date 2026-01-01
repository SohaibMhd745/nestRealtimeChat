import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

import { UsersService } from '../../users/users.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    private usersService: UsersService,
  ) {}

  async createRoom(
    name: string,
    userId: number,
    isPrivate: boolean,
  ): Promise<Room> {
    const sanitizedRoomName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-');
    const room = this.roomsRepository.create({
      name: sanitizedRoomName,
      isPrivate,
      users: [{ id: userId }],
    });
    return this.roomsRepository.save(room);
  }

  async findAll(userId: number): Promise<Room[]> {
    return this.roomsRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'user')
      .where('room.isPrivate = :isPrivate', { isPrivate: false })
      .orWhere('user.id = :userId', { userId })
      .orderBy('room.createdAt', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Room | null> {
    return this.roomsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async hasAccess(roomId: number, userId: number): Promise<boolean> {
    const room = await this.findOne(roomId);
    if (!room) return false;
    if (!room.isPrivate) return true;
    return room.users.some((u) => u.id === userId);
  }

  async addUserToRoom(
    roomId: number,
    userIdToCheck: number,
    usernameToAdd: string,
  ): Promise<void> {
    const room = await this.findOne(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.isPrivate) {
      const isMember = room.users.some((u) => u.id === userIdToCheck);
      if (!isMember) {
        throw new Error('Unauthorized');
      }
    }

    const userToAdd = await this.usersService.findOne(usernameToAdd);
    if (!userToAdd) {
      throw new Error('User not found');
    }

    const alreadyIn = room.users.some((u) => u.id === userToAdd.id);
    if (alreadyIn) {
      throw new ConflictException('User is already in the room');
    }

    room.users.push(userToAdd);
    await this.roomsRepository.save(room);
  }
}
