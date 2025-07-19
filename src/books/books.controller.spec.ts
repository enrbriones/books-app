import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('BooksController', () => {
  let controller: BooksController;

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
  };

  const mockBooksService = {
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
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
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

    controller = module.get<BooksController>(BooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Cien años de soledad',
        description: 'Una obra maestra del realismo mágico',
        authorId: 1,
        editorialId: 1,
        genreId: 1,
        price: 25.99,
        isAvailable: true,
      };
      const expectedResult = { book: mockBook, ok: true };

      mockBooksService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createBookDto);

      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const expectedResult = { books: [mockBook], ok: true };

      mockBooksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(mockBooksService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return book by id', async () => {
      const expectedResult = { book: mockBook, ok: true };

      mockBooksService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update book', async () => {
      const updateBookDto = {
        title: 'Cien años de soledad - Edición especial',
        price: 29.99,
      } as UpdateBookDto;
      const expectedResult = {
        book: { ...mockBook, ...updateBookDto },
        ok: true,
      };

      mockBooksService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateBookDto);

      expect(mockBooksService.update).toHaveBeenCalledWith(1, updateBookDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove book', async () => {
      const expectedResult = {
        message: 'book with id #1 was deleted',
        ok: true,
      };

      mockBooksService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(mockBooksService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
