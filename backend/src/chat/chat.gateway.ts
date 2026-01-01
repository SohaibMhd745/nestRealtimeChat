import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RoomsService } from './rooms/rooms.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private roomsService: RoomsService,
    private usersService: UsersService,
  ) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room_${roomId}`);
    const messages = await this.chatService.getMessages(roomId);
    client.emit('allMessages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`room_${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: { content: string; senderId: number; roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(
      payload.content,
      payload.senderId,
      payload.roomId,
    );

    this.server.to(`room_${payload.roomId}`).emit('newMessage', message);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() roomId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getMessages(roomId);
    client.emit('allMessages', messages);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody()
    payload: { username: string; isTyping: boolean; roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`room_${payload.roomId}`).emit('userTyping', payload);
  }

  @SubscribeMessage('changeColor')
  async handleChangeColor(
    @MessageBody() payload: { userId: number; color: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.usersService.updateColor(payload.userId, payload.color);
    this.server.emit('colorChange', payload);
  }
}
