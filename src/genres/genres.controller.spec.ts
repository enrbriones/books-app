import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('GenresController', () => {
  let controller: GenresController;

  const mockGenre = {
    id: 1,
    name: 'Science Fiction',
    isActive: true,
  };

  const mockGenresService = {
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
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: mockGenresService,
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

    controller = module.get<GenresController>(GenresController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new genre', async () => {
      const createGenreDto: CreateGenreDto = { name: 'Science Fiction' };
      const expectedResult = { genre: mockGenre, ok: true };

      mockGenresService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createGenreDto);

      expect(mockGenresService.create).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const expectedResult = { genres: [mockGenre], ok: true };

      mockGenresService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockGenresService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return genre by id', async () => {
      const expectedResult = { genre: mockGenre, ok: true };

      mockGenresService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(mockGenresService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update genre', async () => {
      const updateGenreDto: UpdateGenreDto = { name: 'Fantasy' };
      const expectedResult = {
        genre: { ...mockGenre, name: 'Fantasy' },
        ok: true,
      };

      mockGenresService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateGenreDto);

      expect(mockGenresService.update).toHaveBeenCalledWith(1, updateGenreDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove genre', async () => {
      const expectedResult = {
        message: 'Genre with id #1 was deleted',
        ok: true,
      };

      mockGenresService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(mockGenresService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
