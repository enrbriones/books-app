import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Author } from './author';
import { Editorial } from './editorial';
import { Genre } from './genre';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  indexes: [
    {
      name: 'idx_book_active',
      fields: ['isActive'],
    },
    {
      name: 'idx_book_author',
      fields: ['authorId'],
    },
    {
      name: 'idx_book_genre',
      fields: ['genreId'],
    },
    {
      name: 'idx_book_editorial',
      fields: ['editorialId'],
    },
  ],
})
export class Book extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  @ApiProperty({
    example: 3,
    description: 'Book ID',
    uniqueItems: true,
  })
  declare id: number;

  @Column
  @ApiProperty()
  title: string;
  @Column
  description: string;

  @ForeignKey(() => Author)
  @Column
  @ApiProperty()
  @Index('idx_book_author')
  authorId: number;

  @BelongsTo(() => Author)
  author: Author;

  @ForeignKey(() => Editorial)
  @Column
  @ApiProperty()
  @Index('idx_book_editorial')
  editorialId: number;

  @BelongsTo(() => Editorial)
  editorial: Editorial;

  @ForeignKey(() => Genre)
  @Column
  @ApiProperty()
  @Index('idx_book_genre')
  genreId: number;

  @BelongsTo(() => Genre)
  genre: Genre;

  @Column(DataType.DECIMAL)
  @ApiProperty()
  price: number;

  @Column({
    defaultValue: true,
  })
  @ApiProperty()
  isAvailable: boolean;

  @Column({
    defaultValue: true,
  })
  @ApiProperty()
  @Index('idx_book_active')
  isActive: boolean;
}
