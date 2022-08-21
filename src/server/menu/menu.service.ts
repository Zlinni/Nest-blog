import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.interface';
import {
  createMenuDto,
  deleteMenuDto,
  editMenuDto,
  findMenuDto,
} from './menu.dto';
import { Menu } from './menu.interface';
@Injectable()
export class MenuService {
  constructor(
    @InjectModel('Menus') private readonly menuModel: Model<Menu>,
    @InjectModel('Users') private readonly userModel: Model<User>,
  ) {}
  async verifyUser(query: findMenuDto): Promise<void> {
    const { userId: _id } = query;
    const data = await this.userModel.findOne({ _id });
    if (!data || data.role !== 'admin') {
      throw new HttpException('无访问权限', 401);
    }
  }
  // 查找所有菜单 需要传入id查找权限
  async findAll(query: findMenuDto): Promise<Menu[]> {
    await this.verifyUser(query);
    console.log(query);
    return await this.menuModel.find();
  }
  // 添加菜单
  async addMenu(body: createMenuDto): Promise<void> {
    const { menuUrl, menuName, source, userId } = body;
    await this.verifyUser({ userId });
    const data = await this.menuModel.findOne({ menuUrl });
    if (data) {
      throw new HttpException('已存在相同的menu', 401);
    }
    await this.menuModel.create(body);
  }
  // 编辑菜单
  async modifyMenu(body: editMenuDto): Promise<void> {
    const { menuName, menuUrl, source, icon, title, userId, _id } = body;
    await this.verifyUser({ userId });
    const data = await this.menuModel.findById({ _id });
    console.log(data, 'datadatadatadata');
    if (data.menuName === menuName) {
      throw new HttpException('已存在相同的menuName', 401);
    }
    if (data.menuUrl === menuUrl) {
      throw new HttpException('已存在相同的menuUrl', 401);
    }
    await this.menuModel.findByIdAndUpdate(_id, body);
  }
  // 删除菜单
  async deleteMenu(body: deleteMenuDto): Promise<void> {
    const { _id, userId } = body;
    await this.verifyUser({ userId });
    await this.menuModel.findByIdAndDelete(_id);
  }
}
