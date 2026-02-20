import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ required: true }) dateTime: Date;
  @Prop({ required: true }) deadline: Date;
  @Prop({ enum: ['High', 'Medium', 'Low'], default: 'Medium' }) priority: string;
  @Prop({ default: false }) isCompleted: boolean;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ enum: ['Work', 'Personal', 'Shopping', 'Health', 'Study', 'Other'], default: 'Other' }) category: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) userId: Types.ObjectId;
}
export const TaskSchema = SchemaFactory.createForClass(Task);