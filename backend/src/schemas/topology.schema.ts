import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TopologyDocument = Topology & Document;

@Schema({ timestamps: true })
export class Topology {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: false })
  isPublic: boolean;
}

export const TopologySchema = SchemaFactory.createForClass(Topology);
