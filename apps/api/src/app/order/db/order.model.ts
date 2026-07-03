import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/db/user.model';

@Table({
  tableName: 'orders',
  timestamps: false,
})
export class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
  })
  userId!: number;

  @Column({
    field: 'product_name',
    type: DataType.STRING,
  })
  productName!: string;

  @Column(DataType.DECIMAL)
  amount!: number;

  @Column(DataType.INTEGER)
  quantity!: number;
}
