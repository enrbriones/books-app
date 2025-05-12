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
  @Column({ allowNull: false, unique: true })
  name: string;

  @Column({
    allowNull: false,
    defaultValue: true,
  })
  @Index('idx_genre_active')
  isActive: boolean;

  @HasMany(() => Book)
  books: Book[];
}
