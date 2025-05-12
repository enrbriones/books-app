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

  @Column({ allowNull: false })
  @ApiProperty()
  title: string;

  @Column
  @ApiProperty()
  description: string;

  @ForeignKey(() => Author)
  @Column({ allowNull: false })
  @ApiProperty()
  @Index('idx_book_author')
  authorId: number;

  @BelongsTo(() => Author)
  author: Author;

  @ForeignKey(() => Editorial)
  @Column({ allowNull: false })
  @ApiProperty()
  @Index('idx_book_editorial')
  editorialId: number;

  @BelongsTo(() => Editorial)
  editorial: Editorial;

  @ForeignKey(() => Genre)
  @Column({ allowNull: false })
  @ApiProperty()
  @Index('idx_book_genre')
  genreId: number;

  @BelongsTo(() => Genre)
  genre: Genre;

  @Column({ type: DataType.DECIMAL, allowNull: false })
  @ApiProperty()
  price: number;

  @Column({
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty()
  isAvailable: boolean;

  @Column({
    allowNull: false,
    defaultValue: true,
  })
  @ApiProperty()
  @Index('idx_book_active')
  isActive: boolean;
}
