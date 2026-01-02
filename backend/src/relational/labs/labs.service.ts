import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateLabInput,
  LabSummaryRow,
  LabsRepository,
  UpdateLabInput,
} from './labs.repository';
import { Topology, TopologyDocument } from '../../schemas/topology.schema';

@Injectable()
export class LabsService {
  constructor(
    private readonly repo: LabsRepository,
    @InjectModel(Topology.name)
    private readonly topologyModel: Model<TopologyDocument>,
  ) {}

  listLabs(ownerMongoUserId: string): Promise<LabSummaryRow[]> {
    return this.repo.listSummariesByOwner(ownerMongoUserId);
  }

  async createLabAndTopology(
    input: CreateLabInput,
  ): Promise<{ labId: string; mongoTopologyId: string }> {
    let allowedModels = input.allowedModels;
    if (allowedModels.length === 0) {
      const defaultModelId = await this.repo.getDefaultDeviceModelId();
      if (defaultModelId) {
        allowedModels = [{ deviceModelId: defaultModelId, quantity: 1 }];
      }
    }

    const { labId } = await this.repo.createLabTx({
      ...input,
      allowedModels,
    });

    try {
      const topo = await this.topologyModel.create({
        name: input.name,
        description: input.description ?? 'Lab topology',
        userId: input.ownerMongoUserId,
        isPublic: input.isPublic,
      });

      const mongoTopologyId = (topo._id as any).toString();
      await this.repo.attachMongoTopology(
        labId,
        input.ownerMongoUserId,
        mongoTopologyId,
      );

      return { labId, mongoTopologyId };
    } catch {
      throw new ServiceUnavailableException({
        message:
          'Lab was created, but Mongo topology attachment failed. Please retry attach.',
        labId,
      });
    }
  }

  updateLab(input: UpdateLabInput): Promise<void> {
    return this.repo.updateLabTx(input);
  }

  deleteLab(labId: string, ownerMongoUserId: string): Promise<void> {
    return this.repo.deleteLab(labId, ownerMongoUserId);
  }

  async attachTopology(
    labId: string,
    ownerMongoUserId: string,
  ): Promise<{ mongoTopologyId: string }> {
    const topo = await this.topologyModel.create({
      name: 'Lab topology',
      description: 'Lab topology',
      userId: ownerMongoUserId,
      isPublic: false,
    });

    const mongoTopologyId = (topo._id as any).toString();
    await this.repo.attachMongoTopology(
      labId,
      ownerMongoUserId,
      mongoTopologyId,
    );
    return { mongoTopologyId };
  }
}
