import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from 'src/db/schema/tag';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
