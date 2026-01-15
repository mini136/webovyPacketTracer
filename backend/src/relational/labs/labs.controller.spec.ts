import { Test, TestingModule } from '@nestjs/testing';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

describe('LabsController', () => {
  let controller: LabsController;
  let service: LabsService;

  const mockLabsService = {
    listLabs: jest.fn(),
    createLabAndTopology: jest.fn(),
    updateLab: jest.fn(),
    deleteLab: jest.fn(),
    attachTopology: jest.fn(),
  };

  const mockRequest = {
    user: {
      _id: { toString: () => 'user123' },
      id: 'user123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [
        {
          provide: LabsService,
          useValue: mockLabsService,
        },
      ],
    }).compile();

    controller = module.get<LabsController>(LabsController);
    service = module.get<LabsService>(LabsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return list of labs', async () => {
      const mockLabs = [
        {
          LabId: 'lab-1',
          Name: 'Test Lab',
          IsPublic: false,
          Status: 'ready' as const,
          OwnerMongoUserId: 'user123',
          MongoTopologyId: 'topo-1',
          CreatedAt: new Date(),
          AllowedModelCount: 1,
          AllowedDeviceTotal: 5,
          RunCount: 0,
          SuccessfulRuns: 0,
          AvgScore: null,
          LastRunAt: null,
        },
      ];

      mockLabsService.listLabs.mockResolvedValue(mockLabs);

      const result = await controller.list(mockRequest);

      expect(result).toEqual(mockLabs);
      expect(mockLabsService.listLabs).toHaveBeenCalledWith('user123');
    });
  });

  describe('create', () => {
    it('should create a new lab with topology', async () => {
      const dto = {
        name: 'New Lab',
        description: 'Lab Description',
        isPublic: false,
        allowedModels: [{ deviceModelId: 1, quantity: 3 }],
      };

      const expectedResult = {
        labId: 'new-lab-uuid',
        mongoTopologyId: 'new-topo-id',
      };

      mockLabsService.createLabAndTopology.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest, dto);

      expect(result).toEqual(expectedResult);
      expect(mockLabsService.createLabAndTopology).toHaveBeenCalledWith({
        ownerMongoUserId: 'user123',
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic,
        allowedModels: dto.allowedModels,
      });
    });

    it('should create lab with defaults when optional fields are missing', async () => {
      const dto = {
        name: 'New Lab',
      };

      const expectedResult = {
        labId: 'new-lab-uuid',
        mongoTopologyId: 'new-topo-id',
      };

      mockLabsService.createLabAndTopology.mockResolvedValue(expectedResult);

      const result = await controller.create(mockRequest, dto as any);

      expect(result).toEqual(expectedResult);
      expect(mockLabsService.createLabAndTopology).toHaveBeenCalledWith({
        ownerMongoUserId: 'user123',
        name: dto.name,
        description: undefined,
        isPublic: false,
        allowedModels: [],
      });
    });
  });

  describe('update', () => {
    it('should update an existing lab', async () => {
      const labId = 'lab-123';
      const dto = {
        name: 'Updated Lab Name',
        description: 'Updated Description',
        isPublic: true,
        allowedModels: [{ deviceModelId: 2, quantity: 5 }],
      };

      mockLabsService.updateLab.mockResolvedValue(undefined);

      const result = await controller.update(mockRequest, labId, dto);

      expect(result).toBeUndefined();
      expect(mockLabsService.updateLab).toHaveBeenCalledWith({
        labId,
        ownerMongoUserId: 'user123',
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic,
        allowedModels: dto.allowedModels,
      });
    });
  });

  describe('remove', () => {
    it('should delete a lab and return success message', async () => {
      const labId = 'lab-123';

      mockLabsService.deleteLab.mockResolvedValue(undefined);

      const result = await controller.remove(mockRequest, labId);

      expect(result).toEqual({ message: 'Lab deleted' });
      expect(mockLabsService.deleteLab).toHaveBeenCalledWith(
        labId,
        'user123',
      );
    });
  });

  describe('attachTopology', () => {
    it('should attach a topology to an existing lab', async () => {
      const labId = 'lab-123';
      const expectedResult = { mongoTopologyId: 'new-topology-id' };

      mockLabsService.attachTopology.mockResolvedValue(expectedResult);

      const result = await controller.attachTopology(mockRequest, labId);

      expect(result).toEqual(expectedResult);
      expect(mockLabsService.attachTopology).toHaveBeenCalledWith(
        labId,
        'user123',
      );
    });
  });
});
