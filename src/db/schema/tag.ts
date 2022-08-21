import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
export type TagDocument = Tag;
@Schema()
export class Tag extends Document {
  @Prop({ required: true})
  name: string;
  @Prop()
  color: string;
  @Prop()
  count: number;
  @Prop()
  createTime: string;
}
export const TagSchema = SchemaFactory.createForClass(Tag);
