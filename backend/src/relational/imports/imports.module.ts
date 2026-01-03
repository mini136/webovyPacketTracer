import { Module } from '@nestjs/common';
import { MssqlModule } from '../mssql/mssql.module';
import { ImportsController } from './imports.controller';
import { ImportsRepository } from './imports.repository';
import { LabsRepository } from '../labs/labs.repository';

@Module({
  imports: [MssqlModule],
  controllers: [ImportsController],
  providers: [ImportsRepository, LabsRepository],
})
export class ImportsModule {}
