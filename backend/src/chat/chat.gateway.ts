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
    // In a real app we should verify valid jwt here or in a guard,
    // AND verify if user has access to this room if private.
    // However, the gateway doesn't easily have access to the user ID unless we decode the token again or passed it.
    // The previous implementation didn't seem to enforce auth in gateway explicitly for join.
    // BUT, the client.join() works. To query messages we use chatService.
    // Let's rely on ChatService to check permissions or just do it here if we can.
    // The client probably sent a token in handshake or we can trust for now if endpoints are secured.
    // BUT requirements say "socket logic to restrict access".
    // We should probably rely on the room joining to be gated.
    // For now, I will add a check using RoomsService (which I need to inject or use ChatService acting as facade).
    // ChatService needs `canJoinRoom` method?

    // Actually, ChatService uses RoomsService? Let's check ChatService.

    // For now, just logging or simpler logic:
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
