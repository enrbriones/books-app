import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './db/user';
import { Author } from './db/author';
import { UsersService } from './users/users.service';
import { BooksModule } from './books/books.module';
import { Editorial } from './db/editorial';
import { Genre } from './db/genre';
import { Book } from './db/book';
import { envs } from './config';
import { AuthorsModule } from './authors/authors.module';
import { GenresModule } from './genres/genres.module';
import { EditorialsModule } from './editorials/editorials.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './interceptors/timeout.interceptors';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUsername,
      password: envs.dbPassword,
      database: envs.database,
      autoLoadModels: true,
      synchronize: true,
      models: [User, Book, Author, Editorial, Genre],
    }),
    SequelizeModule.forFeature([User, Author, Editorial, Genre, Book]),
    BooksModule,
    AuthorsModule,
    GenresModule,
    EditorialsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
