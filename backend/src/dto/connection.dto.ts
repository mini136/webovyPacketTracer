import { IsString, IsEnum } from 'class-validator';
import { CableType } from '../schemas/connection.schema';

export class CreateConnectionDto {
  @IsString()
  sourceDeviceId: string;

  @IsString()
  sourceInterface: string;

  @IsString()
  targetDeviceId: string;

  @IsString()
  targetInterface: string;

  @IsEnum(CableType)
  cableType: CableType;

  @IsString()
  topologyId: string;
}
