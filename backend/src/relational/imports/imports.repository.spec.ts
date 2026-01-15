import { Test, TestingModule } from '@nestjs/testing';
import { ImportsRepository } from './imports.repository';
import { MSSQL_POOL } from '../mssql/mssql.constants';
import type { ConnectionPool } from 'mssql';

describe('ImportsRepository', () => {
  let repository: ImportsRepository;
  let mockPool: any;

  beforeEach(async () => {
    // Create a comprehensive mock for the MSSQL connection pool
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    mockPool = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportsRepository,
        {
          provide: MSSQL_POOL,
          useValue: mockPool,
        },
      ],
    }).compile();

    repository = module.get<ImportsRepository>(ImportsRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createBatch', () => {
    it('should create an import batch successfully', async () => {
      const params = {
        importedByMongoUserId: 'user123',
        sourceFormat: 'json' as const,
        target: 'DeviceModel' as const,
        status: 'ok' as const,
      };

      const mockBatchId = 42;
      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({
        recordset: [{ Id: mockBatchId }],
      });

      const result = await repository.createBatch(params);

      expect(result).toBe(mockBatchId);
      expect(mockRequest.input).toHaveBeenCalledWith(
        'importedByMongoUserId',
        params.importedByMongoUserId,
      );
      expect(mockRequest.input).toHaveBeenCalledWith(
        'sourceFormat',
        params.sourceFormat,
      );
      expect(mockRequest.input).toHaveBeenCalledWith('target', params.target);
      expect(mockRequest.input).toHaveBeenCalledWith('status', params.status);
      expect(mockRequest.query).toHaveBeenCalled();
    });

    it('should create batch with error message when provided', async () => {
      const params = {
        importedByMongoUserId: 'user123',
        sourceFormat: 'csv' as const,
        target: 'Lab' as const,
        status: 'failed' as const,
        errorMessage: 'Initial error',
      };

      const mockBatchId = 43;
      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({
        recordset: [{ Id: mockBatchId }],
      });

      const result = await repository.createBatch(params);

      expect(result).toBe(mockBatchId);
      expect(mockRequest.input).toHaveBeenCalledWith(
        'errorMessage',
        params.errorMessage,
      );
    });

    it('should throw error when batch creation fails', async () => {
      const params = {
        importedByMongoUserId: 'user123',
        sourceFormat: 'json' as const,
        target: 'DeviceModel' as const,
        status: 'ok' as const,
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({
        recordset: [],
      });

      await expect(repository.createBatch(params)).rejects.toThrow(
        'Failed to create import batch.',
      );
    });
  });

  describe('addBatchError', () => {
    it('should add a batch error with all parameters', async () => {
      const params = {
        batchId: 10,
        itemNumber: 5,
        field: 'modelName',
        message: 'Invalid model name format',
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.addBatchError(params);

      expect(mockRequest.input).toHaveBeenCalledWith('batchId', params.batchId);
      expect(mockRequest.input).toHaveBeenCalledWith(
        'itemNumber',
        params.itemNumber,
      );
      expect(mockRequest.input).toHaveBeenCalledWith('field', params.field);
      expect(mockRequest.input).toHaveBeenCalledWith('message', params.message);
      expect(mockRequest.query).toHaveBeenCalled();
    });

    it('should handle null values for optional fields', async () => {
      const params = {
        batchId: 10,
        itemNumber: null,
        field: null,
        message: 'General error',
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.addBatchError(params);

      expect(mockRequest.input).toHaveBeenCalledWith('itemNumber', null);
      expect(mockRequest.input).toHaveBeenCalledWith('field', null);
    });
  });

  describe('setBatchStatus', () => {
    it('should update batch status without error message', async () => {
      const params = {
        batchId: 15,
        status: 'ok' as const,
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.setBatchStatus(params);

      expect(mockRequest.input).toHaveBeenCalledWith('batchId', params.batchId);
      expect(mockRequest.input).toHaveBeenCalledWith('status', params.status);
      expect(mockRequest.input).toHaveBeenCalledWith('errorMessage', null);
      expect(mockRequest.query).toHaveBeenCalled();
    });

    it('should update batch status with error message', async () => {
      const params = {
        batchId: 16,
        status: 'partial' as const,
        errorMessage: 'Some items failed',
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.setBatchStatus(params);

      expect(mockRequest.input).toHaveBeenCalledWith(
        'errorMessage',
        params.errorMessage,
      );
    });
  });

  describe('insertDeviceModel', () => {
    it('should insert a device model successfully', async () => {
      const params = {
        vendor: 'Cisco',
        modelName: 'Catalyst 2960',
        deviceType: 'switch',
        defaultThroughputMbps: 1000,
        isDeprecated: false,
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.insertDeviceModel(params);

      expect(mockRequest.input).toHaveBeenCalledWith('vendor', params.vendor);
      expect(mockRequest.input).toHaveBeenCalledWith(
        'modelName',
        params.modelName,
      );
      expect(mockRequest.input).toHaveBeenCalledWith(
        'deviceType',
        params.deviceType,
      );
      expect(mockRequest.input).toHaveBeenCalledWith(
        'defaultThroughputMbps',
        params.defaultThroughputMbps,
      );
      expect(mockRequest.input).toHaveBeenCalledWith(
        'isDeprecated',
        params.isDeprecated,
      );
      expect(mockRequest.query).toHaveBeenCalled();
    });

    it('should handle deprecated device model', async () => {
      const params = {
        vendor: 'Old Vendor',
        modelName: 'Old Model',
        deviceType: 'router',
        defaultThroughputMbps: 10,
        isDeprecated: true,
      };

      const mockRequest = mockPool.request();
      mockRequest.query.mockResolvedValue({});

      await repository.insertDeviceModel(params);

      expect(mockRequest.input).toHaveBeenCalledWith('isDeprecated', true);
    });

    it('should propagate database errors', async () => {
      const params = {
        vendor: 'Cisco',
        modelName: 'Catalyst 2960',
        deviceType: 'switch',
        defaultThroughputMbps: 1000,
        isDeprecated: false,
      };

      const mockRequest = mockPool.request();
      const dbError = new Error('Unique constraint violation');
      mockRequest.query.mockRejectedValue(dbError);

      await expect(repository.insertDeviceModel(params)).rejects.toThrow(
        'Unique constraint violation',
      );
    });
  });
});
