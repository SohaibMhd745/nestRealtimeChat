import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async saveMessage(
    content: string,
    senderId: number,
    roomId: number,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      content,
      senderId,
      roomId,
    });
    const savedMessage = await this.messagesRepository.save(message);

    return this.messagesRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        roomId: true,
        sender: {
          id: true,
          username: true,
          color: true,
        },
      },
    }) as Promise<Message>;
  }

  async getMessages(roomId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { roomId },
      relations: ['sender'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        roomId: true,
        sender: {
          id: true,
          username: true,
          color: true,
        },
      },
      order: { createdAt: 'ASC' },
      take: 50,
    });
  }
}
