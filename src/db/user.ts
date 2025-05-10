import { Column, Index, Model, Table } from 'sequelize-typescript';

@Table({
  indexes: [
    {
      name: 'idx_user_active',
      fields: ['isActive'],
    },
  ],
})
export class User extends Model {
  @Column
  name: string;

  @Column({ unique: true })
  email: string;

  @Column
  password: string;

  @Column({
    defaultValue: true,
  })
  @Index('idx_user_active')
  isActive: boolean;
}
