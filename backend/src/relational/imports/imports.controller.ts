import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../services/auth.guard';
import { ImportsRepository } from './imports.repository';
import { ImportDeviceModelsDto, ImportLabsDto } from './imports.dto';
import { LabsRepository } from '../labs/labs.repository';

@Controller('imports')
@UseGuards(JwtAuthGuard)
export class ImportsController {
  constructor(
    private readonly importsRepo: ImportsRepository,
    private readonly labsRepo: LabsRepository,
  ) {}

  @Post('device-models/json')
  async importDeviceModels(
    @Req() req: any,
    @Body() dto: ImportDeviceModelsDto,
  ) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;
    const batchId = await this.importsRepo.createBatch({
      importedByMongoUserId: String(userId),
      sourceFormat: 'json',
      target: 'DeviceModel',
      status: 'ok',
    });

    let errorCount = 0;
    for (let index = 0; index < dto.items.length; index++) {
      const item = dto.items[index];
      try {
        await this.importsRepo.insertDeviceModel({
          vendor: item.vendor,
          modelName: item.modelName,
          deviceType: item.deviceType,
          defaultThroughputMbps: item.defaultThroughputMbps,
          isDeprecated: item.isDeprecated ?? false,
        });
      } catch (e) {
        errorCount++;
        await this.importsRepo.addBatchError({
          batchId,
          itemNumber: index + 1,
          field: null,
          message: e instanceof Error ? e.message : 'Insert failed',
        });
      }
    }

    const status =
      errorCount === 0
        ? 'ok'
        : errorCount === dto.items.length
          ? 'failed'
          : 'partial';
    await this.importsRepo.setBatchStatus({
      batchId,
      status,
      errorMessage: errorCount ? `Errors: ${errorCount}` : null,
    });

    return { batchId, status, errorCount };
  }

  @Post('labs/json')
  async importLabs(@Req() req: any, @Body() dto: ImportLabsDto) {
    const userId = (req.user?._id as any)?.toString?.() ?? req.user?.id;

    const batchId = await this.importsRepo.createBatch({
      importedByMongoUserId: String(userId),
      sourceFormat: 'json',
      target: 'Lab',
      status: 'ok',
    });

    let errorCount = 0;
    let createdCount = 0;

    for (let index = 0; index < dto.items.length; index++) {
      const item = dto.items[index];
      try {
        await this.labsRepo.createLabTx({
          ownerMongoUserId: String(userId),
          name: item.name,
          description: item.description,
          isPublic: item.isPublic ?? false,
          allowedModels:
            item.allowedModels?.map((m) => ({
              deviceModelId: Number(m.deviceModelId),
              quantity: Number(m.quantity),
            })) ?? [],
        });
        createdCount++;
      } catch (e) {
        errorCount++;
        await this.importsRepo.addBatchError({
          batchId,
          itemNumber: index + 1,
          field: null,
          message: e instanceof Error ? e.message : 'Insert failed',
        });
      }
    }

    const status =
      errorCount === 0 ? 'ok' : createdCount === 0 ? 'failed' : 'partial';
    await this.importsRepo.setBatchStatus({
      batchId,
      status,
      errorMessage: errorCount ? `Errors: ${errorCount}` : null,
    });

    return { batchId, status, createdCount, errorCount };
  }
}
