/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Author } from 'src/db/author';

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger('AuthorsService');

  constructor(
    @InjectModel(Author)
    private authorModel: typeof Author,
  ) {}

  async create(createAuthorDto: CreateAuthorDto) {
    const { name } = createAuthorDto;
    try {
      const authorExists = await this.authorModel.findOne({
        where: { name: name },
      });
      if (authorExists) {
        throw new HttpException('Author already exists', HttpStatus.FOUND);
      }
      const newAuthor = await this.authorModel.create({
        name: name,
        isActive: true,
      });
      this.logger.log(`Adding a new author named ${name}`);
      return {
        author: newAuthor,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to add an author with name ${name}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const authors = await this.authorModel.findAll({
        where: { isActive: true },
        raw: true,
      });
      return {
        authors,
        ok: true,
      };
    } catch (error) {
      this.logger.error(`An error ocurred when trying to find all authors`);
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const author = await this.authorModel.findOne({
        where: { id: id, isActive: true },
      });
      if (!author) {
        throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
      }
      return {
        author: author,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to get an author with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const { name } = updateAuthorDto;
    try {
      const author = await this.authorModel.findOne({
        where: { id: id, isActive: true },
        raw: true,
      });
      if (!author) {
        throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
      }
      const authorExists = await this.authorModel.findOne({
        where: { name: name },
      });
      if (authorExists) {
        throw new HttpException(
          'Already exists author with this name',
          HttpStatus.FOUND,
        );
      }
      const newAuthor = await author.update({
        name: name,
      });
      this.logger.log(`Updating an author with id #${id}`);
      return {
        author: newAuthor,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to update an author with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const author = await this.authorModel.findByPk(id);
      if (!author) {
        throw new HttpException('Author does not exist', HttpStatus.NOT_FOUND);
      }
      await author.update({ isActive: false });
      this.logger.log(`Deleting an author with id #${id}`);
      return {
        message: `Author with id #${id} was deleted`,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to delete an author with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
