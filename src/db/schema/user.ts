import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type UserDocument = User;
@Schema()
export class User extends Document {
  @Prop({ required: true })
  userName: string;
  @Prop()
  password: string;
  @Prop()
  auth: 'read' | 'write';
  @Prop([{ type: Types.ObjectId, ref: 'menu' }])
  menu: string[];
  @Prop()
  status: number;
  @Prop()
  role: 'guest' | 'admin';
  @Prop()
  avater: string;
  @Prop()
  createTime: string;
  @Prop()
  salt:string;
}
export const UserSchema = SchemaFactory.createForClass(User);

