import { Inject, Injectable } from '@nestjs/common';
import type { ConnectionPool } from 'mssql';
import { MSSQL_POOL } from '../mssql/mssql.constants';

export type LabSummaryRow = {
  LabId: string;
  Name: string;
  IsPublic: boolean;
  Status: 'pending' | 'ready' | 'archived';
  OwnerMongoUserId: string;
  MongoTopologyId: string | null;
  CreatedAt: Date;
  AllowedModelCount: number;
  AllowedDeviceTotal: number;
  RunCount: number;
  SuccessfulRuns: number;
  AvgScore: number | null;
  LastRunAt: Date | null;
};

export type CreateLabInput = {
  ownerMongoUserId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  allowedModels: Array<{ deviceModelId: number; quantity: number }>;
};

export type UpdateLabInput = {
  labId: string;
  ownerMongoUserId: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  allowedModels?: Array<{ deviceModelId: number; quantity: number }>;
};

export type LabRow = {
  Id: string;
  Name: string;
  IsPublic: boolean;
  CreatedAt: Date;
};

@Injectable()
export class LabsRepository {
  constructor(@Inject(MSSQL_POOL) private readonly pool: ConnectionPool) {}

  async getDefaultDeviceModelId(): Promise<number | null> {
    const result = await this.pool.request().query<{ Id: number }>(`
      SELECT TOP 1 Id
      FROM dbo.DeviceModel
      WHERE IsDeprecated = 0
      ORDER BY Id ASC
    `);

    return result.recordset[0]?.Id ?? null;
  }

  async listSummariesByOwner(
    ownerMongoUserId: string,
  ): Promise<LabSummaryRow[]> {
    const result = await this.pool
      .request()
      .input('ownerMongoUserId', ownerMongoUserId).query<LabSummaryRow>(`
        SELECT *
        FROM dbo.vw_LabSummary
        WHERE OwnerMongoUserId = @ownerMongoUserId
        ORDER BY CreatedAt DESC
      `);

    return result.recordset;
  }

  async createLabTx(input: CreateLabInput): Promise<{ labId: string }> {
    const tx = this.pool.transaction();
    await tx.begin();

    try {
      const inserted = await tx
        .request()
        .input('name', input.name)
        .input('description', input.description ?? null)
        .input('isPublic', input.isPublic)
        .input('ownerMongoUserId', input.ownerMongoUserId).query<{
        Id: string;
      }>(`
          INSERT INTO dbo.Lab (Name, Description, IsPublic, Status, MongoTopologyId, OwnerMongoUserId)
          OUTPUT inserted.Id
          VALUES (@name, @description, @isPublic, 'pending', NULL, @ownerMongoUserId)
        `);

      const labId = inserted.recordset[0]?.Id;
      if (!labId) throw new Error('Failed to create lab (no Id returned).');

      for (const item of input.allowedModels) {
        await tx
          .request()
          .input('labId', labId)
          .input('deviceModelId', item.deviceModelId)
          .input('quantity', item.quantity).query(`
            INSERT INTO dbo.LabAllowedModel (LabId, DeviceModelId, Quantity)
            VALUES (@labId, @deviceModelId, @quantity)
          `);
      }

      await tx.commit();
      return { labId };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  async updateLabTx(input: UpdateLabInput): Promise<void> {
    const tx = this.pool.transaction();
    await tx.begin();

    try {
      await tx
        .request()
        .input('labId', input.labId)
        .input('ownerMongoUserId', input.ownerMongoUserId)
        .input('name', input.name ?? null)
        .input('description', input.description ?? null)
        .input('isPublic', input.isPublic ?? null).query(`
          UPDATE dbo.Lab
          SET
            Name = COALESCE(@name, Name),
            Description = COALESCE(@description, Description),
            IsPublic = COALESCE(@isPublic, IsPublic)
          WHERE Id = @labId AND OwnerMongoUserId = @ownerMongoUserId
        `);

      if (input.allowedModels) {
        await tx
          .request()
          .input('labId', input.labId)
          .query(`DELETE FROM dbo.LabAllowedModel WHERE LabId = @labId`);

        for (const item of input.allowedModels) {
          await tx
            .request()
            .input('labId', input.labId)
            .input('deviceModelId', item.deviceModelId)
            .input('quantity', item.quantity).query(`
              INSERT INTO dbo.LabAllowedModel (LabId, DeviceModelId, Quantity)
              VALUES (@labId, @deviceModelId, @quantity)
            `);
        }
      }

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  async deleteLab(labId: string, ownerMongoUserId: string): Promise<void> {
    await this.pool
      .request()
      .input('labId', labId)
      .input('ownerMongoUserId', ownerMongoUserId)
      .query(
        `DELETE FROM dbo.Lab WHERE Id = @labId AND OwnerMongoUserId = @ownerMongoUserId`,
      );
  }

  async attachMongoTopology(
    labId: string,
    ownerMongoUserId: string,
    mongoTopologyId: string,
  ): Promise<void> {
    await this.pool
      .request()
      .input('labId', labId)
      .input('ownerMongoUserId', ownerMongoUserId)
      .input('mongoTopologyId', mongoTopologyId).query(`
        UPDATE dbo.Lab
        SET MongoTopologyId = @mongoTopologyId, Status = 'ready'
        WHERE Id = @labId AND OwnerMongoUserId = @ownerMongoUserId
      `);
  }
}
