import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { AuthorsService } from './authors.service';
import { Author } from '../db/author';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

describe('AuthorsService', () => {
  let service: AuthorsService;

  const mockAuthor = {
    id: 1,
    name: 'Gabriel García Márquez',
    isActive: true,
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockAuthorModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getModelToken(Author),
          useValue: mockAuthorModel,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAuthorDto: CreateAuthorDto = {
      name: 'Gabriel García Márquez',
    };

    it('should create a new author successfully', async () => {
      mockAuthorModel.findOne.mockResolvedValue(null);
      mockAuthorModel.create.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(mockAuthorModel.findOne).toHaveBeenCalledWith({
        where: { name: createAuthorDto.name },
      });
      expect(mockAuthorModel.create).toHaveBeenCalledWith({
        name: createAuthorDto.name,
        isActive: true,
      });
      expect(result).toEqual({
        author: mockAuthor,
        ok: true,
      });
    });

    it('should throw conflict exception when author already exists', async () => {
      mockAuthorModel.findOne.mockResolvedValue(mockAuthor);

      await expect(service.create(createAuthorDto)).rejects.toThrow(
        new HttpException(
          { message: 'Author already exists', statusCode: HttpStatus.CONFLICT },
          HttpStatus.CONFLICT,
        ),
      );

      expect(mockAuthorModel.findOne).toHaveBeenCalledWith({
        where: { name: createAuthorDto.name },
      });
      expect(mockAuthorModel.create).not.toHaveBeenCalled();
    });

    it('should throw internal server error on database error', async () => {
      mockAuthorModel.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createAuthorDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active authors', async () => {
      const mockAuthors = [mockAuthor];
      mockAuthorModel.findAll.mockResolvedValue(mockAuthors);

      const result = await service.findAll();

      expect(mockAuthorModel.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        raw: true,
      });
      expect(result).toEqual({
        authors: mockAuthors,
        ok: true,
      });
    });

    it('should handle database errors', async () => {
      mockAuthorModel.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return author by id', async () => {
      mockAuthorModel.findOne.mockResolvedValue(mockAuthor);

      const result = await service.findOne(1);

      expect(mockAuthorModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(result).toEqual({
        author: mockAuthor,
        ok: true,
      });
    });

    it('should throw not found exception when author does not exist', async () => {
      mockAuthorModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new HttpException('Author not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const updateAuthorDto: UpdateAuthorDto = {
      name: 'Isabel Allende',
    };

    it('should update author successfully', async () => {
      const updatedAuthor = { ...mockAuthor, name: 'Isabel Allende' };
      mockAuthorModel.findOne
        .mockResolvedValueOnce(mockAuthor) // First call to find existing author
        .mockResolvedValueOnce(null); // Second call to check for name conflict

      mockAuthor.update.mockResolvedValue(updatedAuthor);

      const result = await service.update(1, updateAuthorDto);

      expect(mockAuthorModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        raw: true,
      });
      expect(mockAuthorModel.findOne).toHaveBeenCalledWith({
        where: { name: updateAuthorDto.name },
      });
      expect(result).toEqual({
        author: updatedAuthor,
        ok: true,
      });
    });

    it('should throw not found exception when author does not exist', async () => {
      mockAuthorModel.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateAuthorDto)).rejects.toThrow(
        new HttpException('Author not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw conflict exception when name already exists', async () => {
      const anotherAuthor = { ...mockAuthor, id: 2 };
      mockAuthorModel.findOne
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce(anotherAuthor);

      await expect(service.update(1, updateAuthorDto)).rejects.toThrow(
        new HttpException(
          'Already exists author with this name',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete author successfully', async () => {
      mockAuthorModel.findByPk.mockResolvedValue(mockAuthor);
      mockAuthor.update.mockResolvedValue({ ...mockAuthor, isActive: false });

      const result = await service.remove(1);

      expect(mockAuthorModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockAuthor.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toEqual({
        message: 'Author with id #1 was deleted',
        ok: true,
      });
    });

    it('should throw not found exception when author does not exist', async () => {
      mockAuthorModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException('Author does not exist', HttpStatus.NOT_FOUND),
      );
    });
  });
});
