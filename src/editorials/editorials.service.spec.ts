import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { EditorialsService } from './editorials.service';
import { Editorial } from '../db/editorial';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';

describe('EditorialsService', () => {
  let service: EditorialsService;

  const mockEditorial = {
    id: 1,
    name: 'Penguin Random House',
    isActive: true,
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockEditorialModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialsService,
        {
          provide: getModelToken(Editorial),
          useValue: mockEditorialModel,
        },
      ],
    }).compile();

    service = module.get<EditorialsService>(EditorialsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEditorialDto: CreateEditorialDto = {
      name: 'Penguin Random House',
    };

    it('should create a new editorial successfully', async () => {
      mockEditorialModel.findOne.mockResolvedValue(null);
      mockEditorialModel.create.mockResolvedValue(mockEditorial);

      const result = await service.create(createEditorialDto);

      expect(mockEditorialModel.findOne).toHaveBeenCalledWith({
        where: { name: createEditorialDto.name },
      });
      expect(mockEditorialModel.create).toHaveBeenCalledWith({
        name: createEditorialDto.name,
        isActive: true,
      });
      expect(result).toEqual({
        editorial: mockEditorial,
        ok: true,
      });
    });

    it('should throw conflict exception when editorial already exists', async () => {
      mockEditorialModel.findOne.mockResolvedValue(mockEditorial);

      await expect(service.create(createEditorialDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'Editorial already exists',
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        ),
      );

      expect(mockEditorialModel.findOne).toHaveBeenCalledWith({
        where: { name: createEditorialDto.name },
      });
      expect(mockEditorialModel.create).not.toHaveBeenCalled();
    });

    it('should throw internal server error on database error', async () => {
      mockEditorialModel.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createEditorialDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active editorials', async () => {
      const mockEditorials = [mockEditorial];
      mockEditorialModel.findAll.mockResolvedValue(mockEditorials);

      const result = await service.findAll();

      expect(mockEditorialModel.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        raw: true,
      });
      expect(result).toEqual({
        editorials: mockEditorials,
        ok: true,
      });
    });

    it('should handle database errors', async () => {
      mockEditorialModel.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return editorial by id', async () => {
      mockEditorialModel.findOne.mockResolvedValue(mockEditorial);

      const result = await service.findOne(1);

      expect(mockEditorialModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(result).toEqual({
        editorial: mockEditorial,
        ok: true,
      });
    });

    it('should throw not found exception when editorial does not exist', async () => {
      mockEditorialModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new HttpException('Editorial not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const updateEditorialDto: UpdateEditorialDto = {
      name: 'Harper Collins',
    };

    it('should update editorial successfully', async () => {
      const updatedEditorial = { ...mockEditorial, name: 'Harper Collins' };
      mockEditorialModel.findOne
        .mockResolvedValueOnce(mockEditorial) // First call to find existing editorial
        .mockResolvedValueOnce(null); // Second call to check for name conflict

      mockEditorial.update.mockResolvedValue(updatedEditorial);

      const result = await service.update(1, updateEditorialDto);

      expect(mockEditorialModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(mockEditorialModel.findOne).toHaveBeenCalledWith({
        where: { name: updateEditorialDto.name },
      });
      expect(result).toEqual({
        editorial: updatedEditorial,
        ok: true,
      });
    });

    it('should throw not found exception when editorial does not exist', async () => {
      mockEditorialModel.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateEditorialDto)).rejects.toThrow(
        new HttpException('Editorial not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw conflict exception when name already exists', async () => {
      const anotherEditorial = { ...mockEditorial, id: 2 };
      mockEditorialModel.findOne
        .mockResolvedValueOnce(mockEditorial)
        .mockResolvedValueOnce(anotherEditorial);

      await expect(service.update(1, updateEditorialDto)).rejects.toThrow(
        new HttpException(
          'Already exists editorial with this name',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete editorial successfully', async () => {
      mockEditorialModel.findByPk.mockResolvedValue(mockEditorial);
      mockEditorial.update.mockResolvedValue({
        ...mockEditorial,
        isActive: false,
      });

      const result = await service.remove(1);

      expect(mockEditorialModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockEditorial.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toEqual({
        message: 'Editorial with id #1 was deleted',
        ok: true,
      });
    });

    it('should throw not found exception when editorial does not exist', async () => {
      mockEditorialModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException('Editorial does not exist', HttpStatus.NOT_FOUND),
      );
    });
  });
});
