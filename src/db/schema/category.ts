import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type CategoryDocument = Category;
@Schema()
export class Category extends Document {
  @Prop({ required: true})
  name: string;
  @Prop()
  color: string;
  @Prop()
  count: number;
  @Prop()
  createTime: string;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
