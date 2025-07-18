/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from 'src/db/genre';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GenresService {
  private readonly logger = new Logger('GenresService');

  constructor(
    @InjectModel(Genre)
    private genreModel: typeof Genre,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const { name } = createGenreDto;
    try {
      const genreExists = await this.genreModel.findOne({
        where: { name: name },
      });
      if (genreExists) {
        throw new HttpException('Genre already exists', HttpStatus.CONFLICT);
      }
      const newGenre = await this.genreModel.create({
        name: name,
        isActive: true,
      });
      this.logger.log(`Adding a new genre named ${name}`);
      return {
        genre: newGenre,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to add an genre with name ${name}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const genres = await this.genreModel.findAll({
        where: { isActive: true },
        raw: true,
      });
      return {
        genres,
        ok: true,
      };
    } catch (error) {
      this.logger.error(`An error ocurred when trying to find all genres`);
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const genre = await this.genreModel.findOne({
        where: { id: id, isActive: true },
      });
      if (!genre) {
        throw new HttpException('Genre not found', HttpStatus.NOT_FOUND);
      }
      return {
        genre: genre,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to get an genre with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const { name } = updateGenreDto;
    try {
      const genre = await this.genreModel.findOne({
        where: { id: id, isActive: true },
      });
      if (!genre) {
        throw new HttpException('Genre not found', HttpStatus.NOT_FOUND);
      }
      const genreExists = await this.genreModel.findOne({
        where: { name: name },
      });
      if (genreExists) {
        throw new HttpException(
          'Already exists genre with this name',
          HttpStatus.CONFLICT,
        );
      }
      const newGenre = await genre.update({
        name: name,
      });
      this.logger.log(`Updating an genre with id #${id}`);
      return {
        genre: newGenre,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to update an genre with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const genre = await this.genreModel.findByPk(id);
      if (!genre) {
        throw new HttpException('Genre does not exist', HttpStatus.NOT_FOUND);
      }
      await genre.update({ isActive: false });
      this.logger.log(`Deleting a genre with id #${id}`);
      return {
        message: `Genre with id #${id} was deleted`,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to delete a genre with id #${id}`,
      );
      throw new HttpException(
        error.response || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
