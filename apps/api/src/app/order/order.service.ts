import { Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  OrderDto,
  UpdateOrderDto,
} from './models/order.interface';
import { Order } from './db/order.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
  ) {}

  async getAll(): Promise<OrderDto[]> {
    const orders = await this.orderModel.findAll();

    return orders.map((item) => {
      return this.mapDbModelToDto(item);
    });
  }

  async getOrderById(id: number): Promise<OrderDto | undefined> {
    const order = await this.orderModel.findOne({
      where: {
        id: id,
      },
    });

    return order ?? undefined;
  }

  async deleteOrder(id: number): Promise<number> {
    const order = await this.orderModel.findByPk(id);

    order?.destroy();

    return id;
  }

  async createOrder(order: CreateOrderDto): Promise<OrderDto> {
    const createOrder = await this.orderModel.create({
      productName: order.productName,
      quantity: order.quantity,
      amount: order.amount,
      userId: order.userId,
    });

    return this.mapDbModelToDto(createOrder);
  }

  async updateOrder(
    id: number,
    order: UpdateOrderDto,
  ): Promise<OrderDto | undefined> {
    const result = await this.orderModel.update(order, {
      where: {
        id: id,
      },
    });

    if (result[0] === 0) {
      return undefined;
    }

    const item = await this.orderModel.findByPk(id);

    return item ? this.mapDbModelToDto(item) : undefined;
  }

  private mapDbModelToDto(model: Order): OrderDto {
    return {
      id: model.id,
      userId: model.userId,
      productName: model.productName,
      amount: model.amount,
      quantity: model.quantity,
    };
  }
}
