import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TopologyController } from './controllers/topology.controller';
import { DeviceController } from './controllers/device.controller';
import { ConnectionController } from './controllers/connection.controller';
import { TopologyService } from './services/topology.service';
import { DeviceService } from './services/device.service';
import { ConnectionService } from './services/connection.service';
import { SimulationGateway } from './gateways/simulation.gateway';
import { Topology, TopologySchema } from './schemas/topology.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import { Connection, ConnectionSchema } from './schemas/connection.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://46.13.167.200:30111/network-simulator'),
    MongooseModule.forFeature([
      { name: Topology.name, schema: TopologySchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Connection.name, schema: ConnectionSchema },
    ]),
  ],
  controllers: [
    AppController,
    TopologyController,
    DeviceController,
    ConnectionController,
  ],
  providers: [
    AppService,
    TopologyService,
    DeviceService,
    ConnectionService,
    SimulationGateway,
  ],
})
export class AppModule {}
