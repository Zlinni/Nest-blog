import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type MenuDocument = Menu;
@Schema()
export class Menu extends Document {
  @Prop({ required: true })
  menuName: string;
  @Prop({ required: true })
  menuUrl: string;
  @Prop({ required: true })
  source: string;
  @Prop({ required: true })
  icon:string;
  @Prop({ required: true })
  title:string;
}
export const MenuSchema = SchemaFactory.createForClass(Menu);
