/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from 'src/db/book';
import { Author } from 'src/db/author';
import { Editorial } from 'src/db/editorial';
import { Genre } from 'src/db/genre';
import { Sequelize } from 'sequelize-typescript';
import { authorSeed } from 'src/seeds/author.seed';
import { genreSeed } from 'src/seeds/genre.seed';
import { editorialSeed } from 'src/seeds/editorial.seed';
import { bookSeed } from 'src/seeds/book.seed';
import { FindByDto } from './dto/findby-dto';
import { Op, Order } from 'sequelize';
import { Parser } from 'json2csv';

@Injectable()
export class BooksService {
  private readonly logger = new Logger('BooksService');
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(Book)
    private bookModel: typeof Book,
    @InjectModel(Author)
    private authorModel: typeof Author,
    @InjectModel(Editorial)
    private editorialModel: typeof Editorial,
    @InjectModel(Genre)
    private genreModel: typeof Genre,
  ) {}

  async onModuleInit() {
    const countAuthor = await this.authorModel.count();
    if (countAuthor === 0) {
      await this.authorModel.bulkCreate(authorSeed);
      this.logger.warn('Inserting authors data');
    }

    const countGenre = await this.genreModel.count();
    if (countGenre === 0) {
      await this.genreModel.bulkCreate(genreSeed);
      this.logger.warn('Inserting genres data');
    }

    const countEditorial = await this.editorialModel.count();
    if (countEditorial === 0) {
      await this.editorialModel.bulkCreate(editorialSeed);
      this.logger.warn('Inserting editorials data');
    }

    const countBook = await this.bookModel.count();
    if (countBook === 0) {
      await this.bookModel.bulkCreate(bookSeed);
      this.logger.warn('Inserting books data');
    }
  }

  async create(createBookDto: CreateBookDto) {
    const {
      title,
      description,
      authorId,
      editorialId,
      genreId,
      price,
      isAvailable,
    } = createBookDto;
    const transaction = await this.sequelize.transaction();
    try {
      const newBook = await this.bookModel.create(
        {
          title,
          description,
          authorId,
          editorialId,
          genreId,
          price,
          isAvailable,
        },
        { transaction },
      );
      await transaction.commit();
      this.logger.log(`Adding new book "${title}"`);
      return {
        book: newBook,
        ok: true,
      };
    } catch (error) {
      this.logger.error(`An error ocurred when trying to add a new book`);
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findBy(findByDto: FindByDto) {
    try {
      const page = findByDto.page ?? 1;
      const pageSize = findByDto.pageSize ?? 10;
      const genreId = findByDto.genreId;
      const editorialId = findByDto.editorialId;
      const authorId = findByDto.authorId;
      const isAvailable = findByDto.isAvailable;
      const orderBy = findByDto.orderBy;
      const title = findByDto.title;

      const offset = (page - 1) * pageSize;

      const whereClause: any = { isActive: true };

      if (genreId) whereClause.genreId = genreId;
      if (editorialId) whereClause.editorialId = editorialId;
      if (authorId) whereClause.authorId = authorId;

      if (typeof isAvailable === 'boolean')
        whereClause.isAvailable = isAvailable;
      if (title) {
        whereClause.title = { [Op.iLike]: `%${title}%` };
      }

      const parsedOrderBy =
        Array.isArray(orderBy) && orderBy.length > 0
          ? orderBy.map((entry) => this.parseOrderBy(entry))
          : [['title', 'ASC']];

      const { count, rows } = await this.bookModel.findAndCountAll({
        where: whereClause,
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
        limit: pageSize,
        offset,
        order: parsedOrderBy as Order,
      });

      return {
        total: count,
        data: rows,
        currentPage: page,
        totalPages: Math.ceil(count / pageSize),
      };
    } catch (error) {
      console.error(error);
      this.logger.error(
        `An error ocurred when trying to search books: ${error?.message}`,
        error.stack,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseOrderBy(entry: string): any[] {
    const [field, dir] = entry.split(',');
    const direction = (dir || 'ASC').toUpperCase();

    if (!['ASC', 'DESC'].includes(direction)) {
      return ['title', 'ASC'];
    }

    if (field.includes('.')) {
      const [relation, column] = field.split('.');
      return [
        { model: this.getModelByAlias(relation), as: relation },
        column,
        direction,
      ];
    }

    return [field, direction];
  }

  private getModelByAlias(alias: string): any {
    switch (alias) {
      case 'author':
        return Author;
      case 'genre':
        return Genre;
      case 'editorial':
        return Editorial;
      default:
        throw new Error(`Unknown relation alias: ${alias}`);
    }
  }

  async findAll() {
    try {
      const books = await this.bookModel.findAll({ where: { isActive: true } });
      return { books: books, ok: true };
    } catch (error) {
      this.logger.error(`An error ocurred when trying to get all books`);
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.bookModel.findOne({
        where: { id: id, isActive: true },
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
      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      return {
        book: book,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to get a book with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const {
      title,
      description,
      authorId,
      editorialId,
      genreId,
      price,
      isAvailable,
    } = updateBookDto;
    const transaction = await this.sequelize.transaction();
    try {
      const oldBook = await this.bookModel.findOne({
        where: { id, isActive: true },
      });
      if (!oldBook) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
      const newBook = await oldBook.update(
        {
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
          ...(authorId ? { authorId } : {}),
          ...(editorialId ? { editorialId } : {}),
          ...(genreId ? { genreId } : {}),
          ...(price ? { price } : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
        },
        { transaction: transaction },
      );
      await transaction.commit();
      this.logger.log(`Updating new book with id #"${id}"`);

      return {
        book: newBook,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to update a book with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const book = await this.bookModel.findByPk(id);
      if (!book) {
        throw new HttpException('Book does not exist', HttpStatus.NOT_FOUND);
      }
      await book.update({ isActive: false });
      this.logger.log(`Deleting new book with id #"${id}"`);
      return {
        message: `book with id #${id} was deleted`,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to delete a book with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exportCsv() {
    try {
      const books = await this.bookModel.findAll({
        where: { isActive: true },
        include: [
          { model: Author, attributes: ['name'] },
          { model: Genre, attributes: ['name'] },
          { model: Editorial, attributes: ['name'] },
        ],
        raw: true,
      });

      const data = books.map((book) => ({
        ID: book.id,
        Título: book.title,
        Autor: book['author.name'] ?? '',
        Categoría: book['genre.name'] ?? '',
        Editorial: book['editorial.name'] ?? '',
        Precio: book.price,
        Disponible: book.isAvailable ? 'sí' : 'no',
      }));

      const parser = new Parser({ withBOM: true });
      return parser.parse(data);
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to export a books csv file`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
