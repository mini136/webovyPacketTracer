import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum DeviceType {
  ROUTER = 'router',
  SWITCH = 'switch',
  PC = 'pc',
  SERVER = 'server',
  HUB = 'hub',
}

export class Interface {
  @Prop({ required: true })
  name: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  subnetMask?: string;

  @Prop({ default: 'down' })
  status: string;

  @Prop()
  macAddress?: string;
}

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: DeviceType })
  type: DeviceType;

  @Prop({ required: true })
  positionX: number;

  @Prop({ required: true })
  positionY: number;

  @Prop({ type: [Interface], default: [] })
  interfaces: Interface[];

  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>;

  @Prop({ required: true })
  topologyId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
