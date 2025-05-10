/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Editorial } from 'src/db/editorial';

@Injectable()
export class EditorialsService {
  private readonly logger = new Logger('EditorialsService');

  constructor(
    @InjectModel(Editorial)
    private editorialModel: typeof Editorial,
  ) {}

  async create(createEditorialDto: CreateEditorialDto) {
    const { name } = createEditorialDto;
    try {
      const editorialExists = await this.editorialModel.findOne({
        where: { name: name },
      });
      if (editorialExists) {
        throw new HttpException('Editorial already exists', HttpStatus.FOUND);
      }
      const newEditorial = await this.editorialModel.create({
        name: name,
        isActive: true,
      });
      this.logger.log(`Adding a new editorial named ${name}`);

      return {
        editorial: newEditorial,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to add an editorial with name ${name}`,
      );
      throw new HttpException(error.response, error.status);
    }
  }

  async findAll() {
    try {
      const editorials = await this.editorialModel.findAll({
        where: { isActive: true },
        raw: true,
      });
      return {
        editorials,
        ok: true,
      };
    } catch (error) {
      this.logger.error(`An error ocurred when trying to find all editorials`);
      throw new HttpException(error.response, error.status);
    }
  }

  async findOne(id: number) {
    try {
      const editorial = await this.editorialModel.findOne({
        where: { id: id, isActive: true },
      });
      if (!editorial) {
        throw new HttpException('Editorial not found', HttpStatus.NOT_FOUND);
      }
      return {
        editorial: editorial,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to get an editorial with id #${id}`,
      );
      throw new HttpException(error.response, error.status);
    }
  }

  async update(id: number, updateEditorialDto: UpdateEditorialDto) {
    const { name } = updateEditorialDto;
    try {
      const editorial = await this.editorialModel.findOne({
        where: { id: id, isActive: true },
      });
      if (!editorial) {
        throw new HttpException('Editorial not found', HttpStatus.NOT_FOUND);
      }
      const editorialExists = await this.editorialModel.findOne({
        where: { name: name },
      });
      if (editorialExists) {
        throw new HttpException(
          'Already exists editorial with this name',
          HttpStatus.FOUND,
        );
      }
      const newEditorial = await editorial.update({
        name: name,
      });
      this.logger.log(`Updating an editorial with id #${id}`);
      return {
        editorial: newEditorial,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to update an editorial with id #${id}`,
      );
      throw new HttpException(error.response, error.status);
    }
  }

  async remove(id: number) {
    try {
      const editorial = await this.editorialModel.findByPk(id);
      if (!editorial) {
        throw new HttpException(
          'Editorial does not exist',
          HttpStatus.NOT_FOUND,
        );
      }
      await editorial.update({ isActive: false });
      this.logger.log(`Deleting an editorial with id #${id}`);
      return {
        message: `Editorial with id #${id} was deleted`,
        ok: true,
      };
    } catch (error) {
      this.logger.error(
        `An error ocurred when trying to delete an editorial with id #${id}`,
      );
      throw new HttpException(error.response, error.status);
    }
  }
}
