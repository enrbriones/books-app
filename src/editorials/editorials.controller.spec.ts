import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EditorialsController } from './editorials.controller';
import { EditorialsService } from './editorials.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('EditorialsController', () => {
  let controller: EditorialsController;

  const mockEditorial = {
    id: 1,
    name: 'Penguin Random House',
    isActive: true,
  };

  const mockEditorialsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
    sign: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialsController],
      providers: [
        {
          provide: EditorialsService,
          useValue: mockEditorialsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<EditorialsController>(EditorialsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new editorial', async () => {
      const createEditorialDto: CreateEditorialDto = {
        name: 'Penguin Random House',
      };
      const expectedResult = { editorial: mockEditorial, ok: true };

      mockEditorialsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createEditorialDto);

      expect(mockEditorialsService.create).toHaveBeenCalledWith(
        createEditorialDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all editorials', async () => {
      const expectedResult = { editorials: [mockEditorial], ok: true };

      mockEditorialsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockEditorialsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return editorial by id', async () => {
      const expectedResult = { editorial: mockEditorial, ok: true };

      mockEditorialsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(mockEditorialsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update editorial', async () => {
      const updateEditorialDto: UpdateEditorialDto = {
        name: 'Harper Collins',
      };
      const expectedResult = {
        editorial: { ...mockEditorial, name: 'Harper Collins' },
        ok: true,
      };

      mockEditorialsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateEditorialDto);

      expect(mockEditorialsService.update).toHaveBeenCalledWith(
        1,
        updateEditorialDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove editorial', async () => {
      const expectedResult = {
        message: 'Editorial with id #1 was deleted',
        ok: true,
      };

      mockEditorialsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(mockEditorialsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
