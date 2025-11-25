import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTopologyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateTopologyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
