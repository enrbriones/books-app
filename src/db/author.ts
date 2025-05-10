import { Column, HasMany, Index, Model, Table } from 'sequelize-typescript';
import { Book } from './book';

@Table({
  indexes: [
    {
      name: 'idx_author_active',
      fields: ['isActive'],
    },
  ],
})
export class Author extends Model {
  @Column
  name: string;

  @Column({
    defaultValue: true,
  })
  @Index('idx_author_active')
  isActive: boolean;

  @HasMany(() => Book)
  books: Book[];
}
