import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryDocument } from './category';
import { TagDocument } from './tag';

export type PostDocument = Post;
@Schema()
export class Post extends Document {
  @Prop({ required: true, unique: true })
  title: string;
  @Prop({ type: Types.ObjectId, ref: 'TagDocument' })
  tags: TagDocument;
  @Prop({ type: Types.ObjectId, ref: 'CategoryDocument' })
  categories: CategoryDocument;
  @Prop()
  cover: string;
  @Prop()
  abbrlink: number;
  @Prop()
  date: string;
  @Prop()
  top: number;
  @Prop()
  wordCount: number;
  @Prop()
  url: string;
  @Prop()
  updateTime: string;
  @Prop()
  toc: string;
  @Prop()
  intro: string;
}
export const PostSchema = SchemaFactory.createForClass(Post);
