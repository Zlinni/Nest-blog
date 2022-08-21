import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './server/user/user.module';
import { setupConfig } from './config/config.setup';
import { setupMongodb } from './db/mongoose.setup';
import { PostsModule } from './server/posts/posts.module';
import { TagModule } from './server/tag/tag.module';
import { CategoryModule } from './server/category/category.module';
import { MenuModule } from './server/menu/menu.module';
import { WsStartGateway } from './ws/ws.gateway';

@Module({
  imports: [
    UserModule, // config
    setupConfig(),
    // mongodb
    setupMongodb(),
    PostsModule,
    TagModule,
    CategoryModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService,WsStartGateway],
})
export class AppModule {}
