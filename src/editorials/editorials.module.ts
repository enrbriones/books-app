import { Module } from '@nestjs/common';
import { EditorialsService } from './editorials.service';
import { EditorialsController } from './editorials.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Editorial } from 'src/db/editorial';

@Module({
  imports: [SequelizeModule.forFeature([Editorial])],
  controllers: [EditorialsController],
  providers: [EditorialsService],
})
export class EditorialsModule {}
