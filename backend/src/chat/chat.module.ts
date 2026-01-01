import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from './messages/message.entity';
import { Room } from './rooms/room.entity';
import { UsersModule } from '../users/users.module';
import { RoomsService } from './rooms/rooms.service';
import { RoomsController } from './rooms/rooms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room]), UsersModule],
  controllers: [RoomsController],
  providers: [ChatGateway, ChatService, RoomsService],
})
export class ChatModule {}
