import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRoom(
    @Body('name') name: string,
    @Body('isPrivate') isPrivate: boolean,
    @Req() req: any,
  ) {
    return this.roomsService.createRoom(name, req.user.userId, !!isPrivate);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRooms(@Req() req: any) {
    return this.roomsService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/users')
  async addUser(
    @Param('id') id: number,
    @Body('username') username: string,
    @Req() req: any,
  ) {
    return this.roomsService.addUserToRoom(id, req.user.userId, username);
  }
}
