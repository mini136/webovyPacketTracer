import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MssqlModule } from '../mssql/mssql.module';
import { Topology, TopologySchema } from '../../schemas/topology.schema';
import { LabsController } from './labs.controller';
import { LabsRepository } from './labs.repository';
import { LabsService } from './labs.service';

@Module({
  imports: [
    MssqlModule,
    MongooseModule.forFeature([
      { name: Topology.name, schema: TopologySchema },
    ]),
  ],
  controllers: [LabsController],
  providers: [LabsRepository, LabsService],
})
export class LabsModule {}
