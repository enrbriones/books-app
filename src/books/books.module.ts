import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Book } from 'src/db/book';
import { Author } from 'src/db/author';
import { Editorial } from 'src/db/editorial';
import { Genre } from 'src/db/genre';

@Module({
  imports: [SequelizeModule.forFeature([Book, Author, Editorial, Genre])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
