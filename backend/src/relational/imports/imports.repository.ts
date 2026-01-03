import { Inject, Injectable } from '@nestjs/common';
import type { ConnectionPool } from 'mssql';
import { MSSQL_POOL } from '../mssql/mssql.constants';

@Injectable()
export class ImportsRepository {
  constructor(@Inject(MSSQL_POOL) private readonly pool: ConnectionPool) {}

  async createBatch(params: {
    importedByMongoUserId: string;
    sourceFormat: 'json' | 'csv' | 'xml';
    target: 'DeviceModel' | 'Lab';
    status: 'ok' | 'failed' | 'partial';
    errorMessage?: string | null;
  }): Promise<number> {
    const result = await this.pool
      .request()
      .input('importedByMongoUserId', params.importedByMongoUserId)
      .input('sourceFormat', params.sourceFormat)
      .input('target', params.target)
      .input('status', params.status)
      .input('errorMessage', params.errorMessage ?? null).query<{
      Id: number;
    }>(`
        INSERT INTO dbo.ImportBatch (ImportedByMongoUserId, SourceFormat, Target, Status, ErrorMessage)
        OUTPUT inserted.Id
        VALUES (@importedByMongoUserId, @sourceFormat, @target, @status, @errorMessage)
      `);

    const id = result.recordset[0]?.Id;
    if (!id) throw new Error('Failed to create import batch.');
    return id;
  }

  async addBatchError(params: {
    batchId: number;
    itemNumber?: number | null;
    field?: string | null;
    message: string;
  }): Promise<void> {
    await this.pool
      .request()
      .input('batchId', params.batchId)
      .input('itemNumber', params.itemNumber ?? null)
      .input('field', params.field ?? null)
      .input('message', params.message).query(`
        INSERT INTO dbo.ImportBatchError (BatchId, ItemNumber, Field, Message)
        VALUES (@batchId, @itemNumber, @field, @message)
      `);
  }

  async setBatchStatus(params: {
    batchId: number;
    status: 'ok' | 'failed' | 'partial';
    errorMessage?: string | null;
  }): Promise<void> {
    await this.pool
      .request()
      .input('batchId', params.batchId)
      .input('status', params.status)
      .input('errorMessage', params.errorMessage ?? null).query(`
        UPDATE dbo.ImportBatch
        SET Status = @status, ErrorMessage = @errorMessage
        WHERE Id = @batchId
      `);
  }

  async insertDeviceModel(params: {
    vendor: string;
    modelName: string;
    deviceType: string;
    defaultThroughputMbps: number;
    isDeprecated: boolean;
  }): Promise<void> {
    await this.pool
      .request()
      .input('vendor', params.vendor)
      .input('modelName', params.modelName)
      .input('deviceType', params.deviceType)
      .input('defaultThroughputMbps', params.defaultThroughputMbps)
      .input('isDeprecated', params.isDeprecated).query(`
        INSERT INTO dbo.DeviceModel (Vendor, ModelName, DeviceType, DefaultThroughputMbps, IsDeprecated)
        VALUES (@vendor, @modelName, @deviceType, @defaultThroughputMbps, @isDeprecated)
      `);
  }
}
