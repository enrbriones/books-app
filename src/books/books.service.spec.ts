import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { BooksService } from './books.service';
import { Book } from '../db/book';
import { Author } from '../db/author';
import { Editorial } from '../db/editorial';
import { Genre } from '../db/genre';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksService', () => {
  let service: BooksService;

  const mockBook = {
    id: 1,
    title: 'Cien años de soledad',
    description: 'Una obra maestra del realismo mágico',
    authorId: 1,
    editorialId: 1,
    genreId: 1,
    price: 25.99,
    isAvailable: true,
    isActive: true,
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockAuthor = {
    id: 1,
    name: 'Gabriel García Márquez',
    isActive: true,
  };

  const mockEditorial = {
    id: 1,
    name: 'Editorial Sudamericana',
    isActive: true,
  };

  const mockGenre = {
    id: 1,
    name: 'Realismo Mágico',
    isActive: true,
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn(() => mockTransaction),
  };

  const mockBookModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    bulkCreate: jest.fn(),
  };

  const mockAuthorModel = {
    count: jest.fn().mockResolvedValue(1),
    bulkCreate: jest.fn(),
  };

  const mockEditorialModel = {
    count: jest.fn().mockResolvedValue(1),
    bulkCreate: jest.fn(),
  };

  const mockGenreModel = {
    count: jest.fn().mockResolvedValue(1),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
        {
          provide: getModelToken(Author),
          useValue: mockAuthorModel,
        },
        {
          provide: getModelToken(Editorial),
          useValue: mockEditorialModel,
        },
        {
          provide: getModelToken(Genre),
          useValue: mockGenreModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      title: 'Cien años de soledad',
      description: 'Una obra maestra del realismo mágico',
      authorId: 1,
      editorialId: 1,
      genreId: 1,
      price: 25.99,
      isAvailable: true,
    };

    it('should create a new book successfully', async () => {
      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockBookModel.create).toHaveBeenCalledWith(
        {
          title: createBookDto.title,
          description: createBookDto.description,
          authorId: createBookDto.authorId,
          editorialId: createBookDto.editorialId,
          genreId: createBookDto.genreId,
          price: createBookDto.price,
          isAvailable: createBookDto.isAvailable,
        },
        { transaction: mockTransaction },
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({
        book: mockBook,
        ok: true,
      });
    });

    it('should throw internal server error on database error', async () => {
      mockBookModel.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createBookDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active books', async () => {
      const mockBooks = [mockBook];
      mockBookModel.findAll.mockResolvedValue(mockBooks);

      const result = await service.findAll();

      expect(mockBookModel.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual({
        books: mockBooks,
        ok: true,
      });
    });

    it('should handle database errors', async () => {
      mockBookModel.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return book by id with relationships', async () => {
      const mockBookWithRelations = {
        ...mockBook,
        author: mockAuthor,
        editorial: mockEditorial,
        genre: mockGenre,
      };
      mockBookModel.findOne.mockResolvedValue(mockBookWithRelations);

      const result = await service.findOne(1);

      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        include: [
          {
            model: Author,
            as: 'author',
            attributes: ['id', 'name'],
            required: true,
          },
          {
            model: Genre,
            as: 'genre',
            attributes: ['id', 'name'],
            required: true,
          },
          {
            model: Editorial,
            as: 'editorial',
            attributes: ['id', 'name'],
            required: true,
          },
        ],
      });
      expect(result).toEqual({
        book: mockBookWithRelations,
        ok: true,
      });
    });

    it('should throw not found exception when book does not exist', async () => {
      mockBookModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new HttpException('Book not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    const updateBookDto = {
      title: 'Cien años de soledad - Edición especial',
      price: 29.99,
    } as UpdateBookDto;

    it('should update book successfully', async () => {
      const updatedBook = { ...mockBook, ...updateBookDto };
      mockBookModel.findOne.mockResolvedValue(mockBook);
      mockBook.update.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateBookDto);

      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
      });
      expect(mockBook.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({
        book: updatedBook,
        ok: true,
      });
    });

    it('should throw not found exception when book does not exist', async () => {
      mockBookModel.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateBookDto)).rejects.toThrow(
        new HttpException('Book not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete book successfully', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.update.mockResolvedValue({ ...mockBook, isActive: false });

      const result = await service.remove(1);

      expect(mockBookModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockBook.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toEqual({
        message: 'book with id #1 was deleted',
        ok: true,
      });
    });

    it('should throw not found exception when book does not exist', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException('Book does not exist', HttpStatus.NOT_FOUND),
      );
    });
  });
});
