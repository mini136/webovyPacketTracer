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
import { APP_CONFIG, loadAppConfig } from './config/app-config';
import { LabsModule } from './relational/labs/labs.module';
import { ImportsModule } from './relational/imports/imports.module';

const cfg = loadAppConfig();
const enableMssql =
  (process.env.ENABLE_MSSQL ?? '') === 'true' ||
  (cfg.mssql.server !== '' &&
    cfg.mssql.user !== '' &&
    cfg.mssql.database !== '');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      // loadAppConfig() is synchronous and available here; avoid injecting APP_CONFIG
      useFactory: () => ({
        uri: loadAppConfig().mongo.uri,
      }),
    }),
    MongooseModule.forFeature([
      { name: Topology.name, schema: TopologySchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      // similarly, read config directly to avoid ordering issues with APP_CONFIG provider
      useFactory: () => ({
        secret: loadAppConfig().jwt.secret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
    ...(enableMssql ? [LabsModule, ImportsModule] : []),
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
    {
      provide: APP_CONFIG,
      useFactory: loadAppConfig,
    },
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
