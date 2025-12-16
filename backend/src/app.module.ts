import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TopologyController } from './controllers/topology.controller';
import { DeviceController } from './controllers/device.controller';
import { ConnectionController } from './controllers/connection.controller';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { TopologyService } from './services/topology.service';
import { DeviceService } from './services/device.service';
import { ConnectionService } from './services/connection.service';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './services/jwt.strategy';
import { SimulationGateway } from './gateways/simulation.gateway';
import { Topology, TopologySchema } from './schemas/topology.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import { Connection, ConnectionSchema } from './schemas/connection.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://46.13.167.200:30469/network-simulator'),
    MongooseModule.forFeature([
      { name: Topology.name, schema: TopologySchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AppController,
    TopologyController,
    DeviceController,
    ConnectionController,
    AuthController,
    UserController,
  ],
  providers: [
    AppService,
    TopologyService,
    DeviceService,
    ConnectionService,
    AuthService,
    UserService,
    JwtStrategy,
    SimulationGateway,
  ],
})
export class AppModule {}
