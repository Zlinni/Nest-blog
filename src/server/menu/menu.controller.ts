import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  createMenuDto,
  deleteMenuDto,
  editMenuDto,
  findMenuDto,
} from './menu.dto';
import { Menu } from './menu.interface';
import { MenuService } from './menu.service';
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
  @Get('findAll')
  async findAll(@Query() query: findMenuDto): Promise<Menu[]> {
    return await this.menuService.findAll(query);
  }
  // @UseGuards(AuthGuard('jwt'))
  @Post('addMenu')
  async addMenu(@Body() body: createMenuDto): Promise<void> {
    await this.menuService.addMenu(body);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyMenu')
  async modifyMenu(@Body() body: editMenuDto): Promise<void> {
    await this.menuService.modifyMenu(body);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('deleteMenu')
  async deleteMenu(@Body() body: deleteMenuDto): Promise<void> {
    await this.menuService.deleteMenu(body);
  }
}
