import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topology, TopologyDocument } from '../schemas/topology.schema';
import { CreateTopologyDto, UpdateTopologyDto } from '../dto/topology.dto';

@Injectable()
export class TopologyService {
  constructor(
    @InjectModel(Topology.name)
    private topologyModel: Model<TopologyDocument>,
  ) {}

  async create(createTopologyDto: CreateTopologyDto): Promise<Topology> {
    const topology = new this.topologyModel(createTopologyDto);
    return topology.save();
  }

  async findAll(userId: string): Promise<Topology[]> {
    return this.topologyModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<Topology | null> {
    return this.topologyModel.findById(id).exec();
  }

  async update(
    id: string,
    updateTopologyDto: UpdateTopologyDto,
  ): Promise<Topology | null> {
    return this.topologyModel
      .findByIdAndUpdate(id, updateTopologyDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Topology | null> {
    return this.topologyModel.findByIdAndDelete(id).exec();
  }
}
