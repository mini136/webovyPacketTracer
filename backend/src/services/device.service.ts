import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { CreateDeviceDto, UpdateDeviceDto } from '../dto/device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = new this.deviceModel(createDeviceDto);
    return device.save();
  }

  async findByTopology(topologyId: string): Promise<Device[]> {
    return this.deviceModel.find({ topologyId }).exec();
  }

  async findOne(id: string): Promise<Device | null> {
    return this.deviceModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device | null> {
    return this.deviceModel
      .findByIdAndUpdate(id, updateDeviceDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Device | null> {
    return this.deviceModel.findByIdAndDelete(id).exec();
  }

  async removeByTopology(topologyId: string): Promise<any> {
    return this.deviceModel.deleteMany({ topologyId }).exec();
  }
}
