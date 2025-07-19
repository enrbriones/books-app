import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { GenresService } from './genres.service';
import { Genre } from '../db/genre';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

describe('GenresService', () => {
  let service: GenresService;

  const mockGenre = {
    id: 1,
    name: 'Science Fiction',
    isActive: true,
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockGenreModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getModelToken(Genre),
          useValue: mockGenreModel,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createGenreDto: CreateGenreDto = {
      name: 'Science Fiction',
    };

    it('should create a new genre successfully', async () => {
      mockGenreModel.findOne.mockResolvedValue(null);
      mockGenreModel.create.mockResolvedValue(mockGenre);

      const result = await service.create(createGenreDto);

      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { name: createGenreDto.name },
      });
      expect(mockGenreModel.create).toHaveBeenCalledWith({
        name: createGenreDto.name,
        isActive: true,
      });
      expect(result).toEqual({
        genre: mockGenre,
        ok: true,
      });
    });

    it('should throw conflict exception when genre already exists', async () => {
      mockGenreModel.findOne.mockResolvedValue(mockGenre);

      await expect(service.create(createGenreDto)).rejects.toThrow(
        new HttpException(
          { message: 'Genre already exists', statusCode: HttpStatus.CONFLICT },
          HttpStatus.CONFLICT,
        ),
      );

      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { name: createGenreDto.name },
      });
      expect(mockGenreModel.create).not.toHaveBeenCalled();
    });

    it('should throw internal server error on database error', async () => {
      mockGenreModel.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createGenreDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active genres', async () => {
      const mockGenres = [mockGenre];
      mockGenreModel.findAll.mockResolvedValue(mockGenres);

      const result = await service.findAll();

      expect(mockGenreModel.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        raw: true,
      });
      expect(result).toEqual({
        genres: mockGenres,
        ok: true,
      });
    });

    it('should handle database errors', async () => {
      mockGenreModel.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return genre by id', async () => {
      mockGenreModel.findOne.mockResolvedValue(mockGenre);

      const result = await service.findOne(1);

      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(result).toEqual({
        genre: mockGenre,
        ok: true,
      });
    });

    it('should throw not found exception when genre does not exist', async () => {
      mockGenreModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new HttpException('Genre not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const updateGenreDto: UpdateGenreDto = {
      name: 'Fantasy',
    };

    it('should update genre successfully', async () => {
      const updatedGenre = { ...mockGenre, name: 'Fantasy' };
      mockGenreModel.findOne
        .mockResolvedValueOnce(mockGenre) // First call to find existing genre
        .mockResolvedValueOnce(null); // Second call to check for name conflict

      mockGenre.update.mockResolvedValue(updatedGenre);

      const result = await service.update(1, updateGenreDto);

      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(mockGenreModel.findOne).toHaveBeenCalledWith({
        where: { name: updateGenreDto.name },
      });
      expect(result).toEqual({
        genre: updatedGenre,
        ok: true,
      });
    });

    it('should throw not found exception when genre does not exist', async () => {
      mockGenreModel.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateGenreDto)).rejects.toThrow(
        new HttpException('Genre not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw conflict exception when name already exists', async () => {
      const anotherGenre = { ...mockGenre, id: 2 };
      mockGenreModel.findOne
        .mockResolvedValueOnce(mockGenre)
        .mockResolvedValueOnce(anotherGenre);

      await expect(service.update(1, updateGenreDto)).rejects.toThrow(
        new HttpException(
          'Already exists genre with this name',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete genre successfully', async () => {
      mockGenreModel.findByPk.mockResolvedValue(mockGenre);
      mockGenre.update.mockResolvedValue({ ...mockGenre, isActive: false });

      const result = await service.remove(1);

      expect(mockGenreModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockGenre.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toEqual({
        message: 'Genre with id #1 was deleted',
        ok: true,
      });
    });

    it('should throw not found exception when genre does not exist', async () => {
      mockGenreModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException('Genre does not exist', HttpStatus.NOT_FOUND),
      );
    });
  });
});
