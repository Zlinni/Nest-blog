import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from 'src/db/schema/category';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Categories', schema: CategorySchema }])],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
