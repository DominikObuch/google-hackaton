import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from 'sequelize-typescript';
import { Order } from '../../order/db/order.model';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    field: 'birth_year',
    type: DataType.INTEGER,
  })
  birthYear!: number;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  surname!: string;

  @HasMany(() => Order)
  orders!: Order[];
}
