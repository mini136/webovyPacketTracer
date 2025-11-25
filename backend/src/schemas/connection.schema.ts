import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectionDocument = Connection & Document;

export enum CableType {
  STRAIGHT = 'straight',
  CROSSOVER = 'crossover',
  FIBER = 'fiber',
  CONSOLE = 'console',
}

@Schema({ timestamps: true })
export class Connection {
  @Prop({ required: true })
  sourceDeviceId: string;

  @Prop({ required: true })
  sourceInterface: string;

  @Prop({ required: true })
  targetDeviceId: string;

  @Prop({ required: true })
  targetInterface: string;

  @Prop({ required: true, enum: CableType })
  cableType: CableType;

  @Prop({ default: 'down' })
  status: string;

  @Prop({ required: true })
  topologyId: string;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
