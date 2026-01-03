import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportDeviceModelItemDto {
  @IsString()
  @MaxLength(60)
  vendor: string;

  @IsString()
  @MaxLength(80)
  modelName: string;

  @IsString()
  @IsIn(['router', 'switch', 'pc', 'server', 'hub'])
  deviceType: 'router' | 'switch' | 'pc' | 'server' | 'hub';

  @IsNumber()
  defaultThroughputMbps: number;

  @IsOptional()
  @IsBoolean()
  isDeprecated?: boolean;
}

export class ImportDeviceModelsDto {
  @IsOptional()
  @IsString()
  @IsIn(['json'])
  sourceFormat?: 'json';

  @IsArray()
  @ArrayMaxSize(2000)
  @ValidateNested({ each: true })
  @Type(() => ImportDeviceModelItemDto)
  items: ImportDeviceModelItemDto[];
}

export class ImportLabAllowedModelItemDto {
  @IsNumber()
  deviceModelId: number;

  @IsNumber()
  quantity: number;
}

export class ImportLabItemDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ImportLabAllowedModelItemDto)
  allowedModels?: ImportLabAllowedModelItemDto[];
}

export class ImportLabsDto {
  @IsOptional()
  @IsString()
  @IsIn(['json'])
  sourceFormat?: 'json';

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ImportLabItemDto)
  items: ImportLabItemDto[];
}
