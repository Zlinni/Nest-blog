import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from 'src/db/schema/post';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TagSchema } from 'src/db/schema/tag';
import { CategorySchema } from 'src/db/schema/category';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Posts', schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }]),
    MongooseModule.forFeature([{ name: 'Categories', schema: CategorySchema }])
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
