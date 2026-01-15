import { Test, TestingModule } from '@nestjs/testing';
import { ImportsController } from './imports.controller';
import { ImportsRepository } from './imports.repository';
import { LabsRepository } from '../labs/labs.repository';

describe('ImportsController', () => {
  let controller: ImportsController;
  let importsRepo: ImportsRepository;
  let labsRepo: LabsRepository;

  const mockImportsRepository = {
    createBatch: jest.fn(),
    addBatchError: jest.fn(),
    setBatchStatus: jest.fn(),
    insertDeviceModel: jest.fn(),
  };

  const mockLabsRepository = {
    createLabTx: jest.fn(),
  };

  const mockRequest = {
    user: {
      _id: { toString: () => 'user123' },
      id: 'user123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportsController],
      providers: [
        {
          provide: ImportsRepository,
          useValue: mockImportsRepository,
        },
        {
          provide: LabsRepository,
          useValue: mockLabsRepository,
        },
      ],
    }).compile();

    controller = module.get<ImportsController>(ImportsController);
    importsRepo = module.get<ImportsRepository>(ImportsRepository);
    labsRepo = module.get<LabsRepository>(LabsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importDeviceModels', () => {
    it('should import device models successfully', async () => {
      const dto = {
        items: [
          {
            vendor: 'Cisco',
            modelName: 'Catalyst 2960',
            deviceType: 'switch' as const,
            defaultThroughputMbps: 1000,
            isDeprecated: false,
          },
          {
            vendor: 'HP',
            modelName: 'ProCurve 2510',
            deviceType: 'switch' as const,
            defaultThroughputMbps: 100,
            isDeprecated: false,
          },
        ],
      };

      const batchId = 1;
      mockImportsRepository.createBatch.mockResolvedValue(batchId);
      mockImportsRepository.insertDeviceModel.mockResolvedValue(undefined);
      mockImportsRepository.setBatchStatus.mockResolvedValue(undefined);

      const result = await controller.importDeviceModels(mockRequest, dto);

      expect(result).toEqual({
        batchId,
        status: 'ok',
        errorCount: 0,
      });

      expect(mockImportsRepository.createBatch).toHaveBeenCalledWith({
        importedByMongoUserId: 'user123',
        sourceFormat: 'json',
        target: 'DeviceModel',
        status: 'ok',
      });

      expect(mockImportsRepository.insertDeviceModel).toHaveBeenCalledTimes(2);
      expect(mockImportsRepository.setBatchStatus).toHaveBeenCalledWith({
        batchId,
        status: 'ok',
        errorMessage: null,
      });
    });

    it('should handle partial import errors', async () => {
      const dto = {
        items: [
          {
            vendor: 'Cisco',
            modelName: 'Catalyst 2960',
            deviceType: 'switch' as const,
            defaultThroughputMbps: 1000,
            isDeprecated: false,
          },
          {
            vendor: 'Invalid',
            modelName: 'Bad Model',
            deviceType: 'switch' as const,
            defaultThroughputMbps: -100, // Invalid value
            isDeprecated: false,
          },
        ],
      };

      const batchId = 2;
      mockImportsRepository.createBatch.mockResolvedValue(batchId);
      mockImportsRepository.insertDeviceModel
        .mockResolvedValueOnce(undefined) // First insert succeeds
        .mockRejectedValueOnce(new Error('Constraint violation')); // Second fails
      mockImportsRepository.addBatchError.mockResolvedValue(undefined);
      mockImportsRepository.setBatchStatus.mockResolvedValue(undefined);

      const result = await controller.importDeviceModels(mockRequest, dto);

      expect(result).toEqual({
        batchId,
        status: 'partial',
        errorCount: 1,
      });

      expect(mockImportsRepository.addBatchError).toHaveBeenCalledWith({
        batchId,
        itemNumber: 2,
        field: null,
        message: 'Constraint violation',
      });

      expect(mockImportsRepository.setBatchStatus).toHaveBeenCalledWith({
        batchId,
        status: 'partial',
        errorMessage: 'Errors: 1',
      });
    });

    it('should handle complete import failure', async () => {
      const dto = {
        items: [
          {
            vendor: 'Bad1',
            modelName: 'Model1',
            deviceType: 'switch' as const,
            defaultThroughputMbps: -1,
            isDeprecated: false,
          },
          {
            vendor: 'Bad2',
            modelName: 'Model2',
            deviceType: 'switch' as const,
            defaultThroughputMbps: -2,
            isDeprecated: false,
          },
        ],
      };

      const batchId = 3;
      mockImportsRepository.createBatch.mockResolvedValue(batchId);
      mockImportsRepository.insertDeviceModel.mockRejectedValue(
        new Error('All inserts failed'),
      );
      mockImportsRepository.addBatchError.mockResolvedValue(undefined);
      mockImportsRepository.setBatchStatus.mockResolvedValue(undefined);

      const result = await controller.importDeviceModels(mockRequest, dto);

      expect(result).toEqual({
        batchId,
        status: 'failed',
        errorCount: 2,
      });

      expect(mockImportsRepository.setBatchStatus).toHaveBeenCalledWith({
        batchId,
        status: 'failed',
        errorMessage: 'Errors: 2',
      });
    });
  });

  describe('importLabs', () => {
    it('should import labs successfully', async () => {
      const dto = {
        items: [
          {
            name: 'Lab 1',
            description: 'Test Lab 1',
            isPublic: false,
            allowedModels: [
              { deviceModelId: '1', quantity: '2' },
              { deviceModelId: '3', quantity: '4' },
            ],
          },
          {
            name: 'Lab 2',
            description: 'Test Lab 2',
            isPublic: true,
            allowedModels: [],
          },
        ],
      };

      const batchId = 10;
      mockImportsRepository.createBatch.mockResolvedValue(batchId);
      mockLabsRepository.createLabTx.mockResolvedValue({ labId: 'lab-uuid' });
      mockImportsRepository.setBatchStatus.mockResolvedValue(undefined);

      const result = await controller.importLabs(mockRequest, dto);

      expect(result).toEqual({
        batchId,
        status: 'ok',
        errorCount: 0,
        createdCount: 2,
      });

      expect(mockImportsRepository.createBatch).toHaveBeenCalledWith({
        importedByMongoUserId: 'user123',
        sourceFormat: 'json',
        target: 'Lab',
        status: 'ok',
      });

      expect(mockLabsRepository.createLabTx).toHaveBeenCalledTimes(2);
      expect(mockLabsRepository.createLabTx).toHaveBeenNthCalledWith(1, {
        ownerMongoUserId: 'user123',
        name: 'Lab 1',
        description: 'Test Lab 1',
        isPublic: false,
        allowedModels: [
          { deviceModelId: 1, quantity: 2 },
          { deviceModelId: 3, quantity: 4 },
        ],
      });
    });

    it('should handle lab import errors', async () => {
      const dto = {
        items: [
          {
            name: 'Valid Lab',
            description: 'This will succeed',
            isPublic: false,
            allowedModels: [],
          },
          {
            name: 'Invalid Lab',
            description: 'This will fail',
            isPublic: false,
            allowedModels: [],
          },
        ],
      };

      const batchId = 11;
      mockImportsRepository.createBatch.mockResolvedValue(batchId);
      mockLabsRepository.createLabTx
        .mockResolvedValueOnce({ labId: 'lab-uuid-1' })
        .mockRejectedValueOnce(new Error('Duplicate lab name'));
      mockImportsRepository.addBatchError.mockResolvedValue(undefined);
      mockImportsRepository.setBatchStatus.mockResolvedValue(undefined);

      const result = await controller.importLabs(mockRequest, dto);

      expect(result).toEqual({
        batchId,
        status: 'partial',
        errorCount: 1,
        createdCount: 1,
      });

      expect(mockImportsRepository.addBatchError).toHaveBeenCalledWith({
        batchId,
        itemNumber: 2,
        field: null,
        message: 'Duplicate lab name',
      });

      expect(mockImportsRepository.setBatchStatus).toHaveBeenCalledWith({
        batchId,
        status: 'partial',
        errorMessage: 'Errors: 1',
      });
    });
  });
});
