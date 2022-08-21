// user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeleteUserDto, EditUserDTO, UserDTO } from './user.dto';
import { info, infoToken, User } from './user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /getUserList
  @UseGuards(AuthGuard('jwt'))
  @Get('getUserList')
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  // POST /register
  @Post('register')
  async register(@Body() body: UserDTO): Promise<void | infoToken> {
    return await this.userService.register(body);
  }

  // Post /modifyUser
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyUser')
  async editUser(@Body() body: EditUserDTO): Promise<void> {
    await this.userService.editUser(body);
  }

  // Post /deleteUser
  @UseGuards(AuthGuard('jwt'))
  @Post('deleteUser')
  async deleteUser(@Body() body: DeleteUserDto): Promise<void> {
    await this.userService.deleteUser(body);
  }

  @Post('login')
  async login(@Body() body: UserDTO): Promise<info | void> {
    return await this.userService.login(body);
  }
}
