import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuSchema } from 'src/db/schema/menu';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/db/schema/user';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Menus', schema: MenuSchema }]),
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
