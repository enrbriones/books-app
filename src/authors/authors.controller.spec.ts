import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('AuthorsController', () => {
  let controller: AuthorsController;

  const mockAuthor = {
    id: 1,
    name: 'Gabriel García Márquez',
    isActive: true,
  };

  const mockAuthorsService = {
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
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: mockAuthorsService,
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

    controller = module.get<AuthorsController>(AuthorsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const createAuthorDto: CreateAuthorDto = {
        name: 'Gabriel García Márquez',
      };
      const expectedResult = {
        author: mockAuthor,
        ok: true,
      };

      mockAuthorsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createAuthorDto);

      expect(mockAuthorsService.create).toHaveBeenCalledWith(createAuthorDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all authors', async () => {
      const expectedResult = {
        authors: [mockAuthor],
        ok: true,
      };

      mockAuthorsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockAuthorsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return author by id', async () => {
      const expectedResult = {
        author: mockAuthor,
        ok: true,
      };

      mockAuthorsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(mockAuthorsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update author', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        name: 'Isabel Allende',
      };
      const updatedAuthor = { ...mockAuthor, name: 'Isabel Allende' };
      const expectedResult = {
        author: updatedAuthor,
        ok: true,
      };

      mockAuthorsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateAuthorDto);

      expect(mockAuthorsService.update).toHaveBeenCalledWith(
        1,
        updateAuthorDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove author', async () => {
      const expectedResult = {
        message: 'Author with id #1 was deleted',
        ok: true,
      };

      mockAuthorsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(mockAuthorsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
