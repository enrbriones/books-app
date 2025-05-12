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
  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false, unique: true })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({
    allowNull: false,
    defaultValue: true,
  })
  @Index('idx_user_active')
  isActive: boolean;
}
