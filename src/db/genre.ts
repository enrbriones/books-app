import { Column, HasMany, Index, Model, Table } from 'sequelize-typescript';
import { Book } from './book';

@Table({
  indexes: [
    {
      name: 'idx_genre_active',
      fields: ['isActive'],
    },
  ],
})
export class Genre extends Model {
  @Column({ unique: true })
  name: string;

  @Column({
    defaultValue: true,
  })
  @Index('idx_genre_active')
  isActive: boolean;

  @HasMany(() => Book)
  books: Book[];
}
