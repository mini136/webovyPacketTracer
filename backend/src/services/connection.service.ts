import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, ConnectionDocument } from '../schemas/connection.schema';
import { CreateConnectionDto } from '../dto/connection.dto';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectModel(Connection.name)
    private connectionModel: Model<ConnectionDocument>,
  ) {}

  async create(createConnectionDto: CreateConnectionDto): Promise<Connection> {
    const connection = new this.connectionModel(createConnectionDto);
    return connection.save();
  }

  async findByTopology(topologyId: string): Promise<Connection[]> {
    return this.connectionModel.find({ topologyId }).exec();
  }

  async findOne(id: string): Promise<Connection | null> {
    return this.connectionModel.findById(id).exec();
  }

  async remove(id: string): Promise<Connection | null> {
    return this.connectionModel.findByIdAndDelete(id).exec();
  }

  async removeByTopology(topologyId: string): Promise<any> {
    return this.connectionModel.deleteMany({ topologyId }).exec();
  }
}
