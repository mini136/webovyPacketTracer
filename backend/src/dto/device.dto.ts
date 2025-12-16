import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';
import { DeviceType } from '../schemas/device.schema';

export class CreateDeviceDto {
  @IsString()
  name: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsString()
  topologyId: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  positionX?: number;

  @IsOptional()
  @IsNumber()
  positionY?: number;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}
