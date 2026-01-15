import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LabsService } from './labs.service';
import { LabsRepository } from './labs.repository';
import { Topology } from '../../schemas/topology.schema';

describe('LabsService', () => {
  let service: LabsService;
  let repository: LabsRepository;
  let topologyModel: any;

  const mockLabsRepository = {
    listSummariesByOwner: jest.fn(),
    createLabTx: jest.fn(),
    updateLabTx: jest.fn(),
    deleteLab: jest.fn(),
    attachMongoTopology: jest.fn(),
    getDefaultDeviceModelId: jest.fn(),
  };

  const mockTopologyModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabsService,
        {
          provide: LabsRepository,
          useValue: mockLabsRepository,
        },
        {
          provide: getModelToken(Topology.name),
          useValue: mockTopologyModel,
        },
      ],
    }).compile();

    service = module.get<LabsService>(LabsService);
    repository = module.get<LabsRepository>(LabsRepository);
    topologyModel = module.get(getModelToken(Topology.name));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLabAndTopology', () => {
    it('should create a lab with topology successfully', async () => {
      const input = {
        ownerMongoUserId: 'user123',
        name: 'Test Lab',
        description: 'Test Description',
        isPublic: false,
        allowedModels: [{ deviceModelId: 1, quantity: 2 }],
      };

      const labId = 'lab-uuid-123';
      const mongoTopologyId = 'mongo-topo-123';

      mockLabsRepository.createLabTx.mockResolvedValue({ labId });
      mockTopologyModel.create.mockResolvedValue({
        _id: mongoTopologyId,
      });
      mockLabsRepository.attachMongoTopology.mockResolvedValue(undefined);

      const result = await service.createLabAndTopology(input);

      expect(result).toEqual({ labId, mongoTopologyId });
      expect(mockLabsRepository.createLabTx).toHaveBeenCalledWith(input);
      expect(mockTopologyModel.create).toHaveBeenCalledWith({
        name: input.name,
        description: input.description,
        userId: input.ownerMongoUserId,
        isPublic: input.isPublic,
      });
      expect(mockLabsRepository.attachMongoTopology).toHaveBeenCalledWith(
        labId,
        input.ownerMongoUserId,
        mongoTopologyId,
      );
    });

    it('should add default device model when allowedModels is empty', async () => {
      const input = {
        ownerMongoUserId: 'user123',
        name: 'Test Lab',
        description: 'Test Description',
        isPublic: false,
        allowedModels: [],
      };

      const defaultModelId = 5;
      const labId = 'lab-uuid-123';
      const mongoTopologyId = 'mongo-topo-123';

      mockLabsRepository.getDefaultDeviceModelId.mockResolvedValue(
        defaultModelId,
      );
      mockLabsRepository.createLabTx.mockResolvedValue({ labId });
      mockTopologyModel.create.mockResolvedValue({
        _id: mongoTopologyId,
      });
      mockLabsRepository.attachMongoTopology.mockResolvedValue(undefined);

      await service.createLabAndTopology(input);

      expect(mockLabsRepository.getDefaultDeviceModelId).toHaveBeenCalled();
      expect(mockLabsRepository.createLabTx).toHaveBeenCalledWith({
        ...input,
        allowedModels: [{ deviceModelId: defaultModelId, quantity: 1 }],
      });
    });

    it('should throw ServiceUnavailableException when topology creation fails', async () => {
      const input = {
        ownerMongoUserId: 'user123',
        name: 'Test Lab',
        description: 'Test Description',
        isPublic: false,
        allowedModels: [{ deviceModelId: 1, quantity: 2 }],
      };

      const labId = 'lab-uuid-123';

      mockLabsRepository.createLabTx.mockResolvedValue({ labId });
      mockTopologyModel.create.mockRejectedValue(new Error('Mongo error'));

      await expect(service.createLabAndTopology(input)).rejects.toThrow(
        'Lab was created, but Mongo topology attachment failed. Please retry attach.',
      );
    });
  });

  describe('listLabs', () => {
    it('should return list of labs for owner', async () => {
      const ownerMongoUserId = 'user123';
      const mockLabs = [
        {
          LabId: 'lab-1',
          Name: 'Lab 1',
          IsPublic: false,
          Status: 'ready' as const,
          OwnerMongoUserId: ownerMongoUserId,
          MongoTopologyId: 'topo-1',
          CreatedAt: new Date(),
          AllowedModelCount: 2,
          AllowedDeviceTotal: 5,
          RunCount: 10,
          SuccessfulRuns: 8,
          AvgScore: 85.5,
          LastRunAt: new Date(),
        },
      ];

      mockLabsRepository.listSummariesByOwner.mockResolvedValue(mockLabs);

      const result = await service.listLabs(ownerMongoUserId);

      expect(result).toEqual(mockLabs);
      expect(mockLabsRepository.listSummariesByOwner).toHaveBeenCalledWith(
        ownerMongoUserId,
      );
    });
  });

  describe('updateLab', () => {
    it('should update lab successfully', async () => {
      const input = {
        labId: 'lab-123',
        ownerMongoUserId: 'user123',
        name: 'Updated Lab Name',
        description: 'Updated Description',
        isPublic: true,
        allowedModels: [{ deviceModelId: 2, quantity: 3 }],
      };

      mockLabsRepository.updateLabTx.mockResolvedValue(undefined);

      await service.updateLab(input);

      expect(mockLabsRepository.updateLabTx).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteLab', () => {
    it('should delete lab successfully', async () => {
      const labId = 'lab-123';
      const ownerMongoUserId = 'user123';

      mockLabsRepository.deleteLab.mockResolvedValue(undefined);

      await service.deleteLab(labId, ownerMongoUserId);

      expect(mockLabsRepository.deleteLab).toHaveBeenCalledWith(
        labId,
        ownerMongoUserId,
      );
    });
  });

  describe('attachTopology', () => {
    it('should attach a new topology to an existing lab', async () => {
      const labId = 'lab-123';
      const ownerMongoUserId = 'user123';
      const mongoTopologyId = 'new-topo-123';

      mockTopologyModel.create.mockResolvedValue({
        _id: mongoTopologyId,
      });
      mockLabsRepository.attachMongoTopology.mockResolvedValue(undefined);

      const result = await service.attachTopology(labId, ownerMongoUserId);

      expect(result).toEqual({ mongoTopologyId });
      expect(mockTopologyModel.create).toHaveBeenCalledWith({
        name: 'Lab topology',
        description: 'Lab topology',
        userId: ownerMongoUserId,
        isPublic: false,
      });
      expect(mockLabsRepository.attachMongoTopology).toHaveBeenCalledWith(
        labId,
        ownerMongoUserId,
        mongoTopologyId,
      );
    });
  });
});
