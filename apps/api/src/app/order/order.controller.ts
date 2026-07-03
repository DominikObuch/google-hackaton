import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  OrderDto,
  UpdateOrderDto,
} from './models/order.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
    type: [OrderDto],
  })
  async getAll() {
    return await this.orderService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the order' })
  @ApiResponse({
    status: 200,
    description: 'The order with the specified id',
    type: OrderDto,
  })
  async getOrderById(@Param('id') id: number) {
    const order = await this.orderService.getOrderById(Number(id));
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the order' })
  @ApiResponse({
    status: 200,
    description: 'The order with the specified id has been deleted',
    type: Number,
  })
  async deleteOrder(@Param('id') id: number) {
    const order = await this.orderService.getOrderById(Number(id));
    if (!order) {
      throw new NotFoundException(`DELETE - Order with id ${id} not found`);
    }

    return await this.orderService.deleteOrder(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({
    type: CreateOrderDto,
    description: 'The data to create a new order',
  })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created',
    type: CreateOrderDto,
  })
  async createOrder(@Body() order: CreateOrderDto) {
    return await this.orderService.createOrder(order);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an order by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the order' })
  @ApiBody({
    type: UpdateOrderDto,
    description: 'The fields to update in the order',
  })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully updated',
    type: OrderDto,
  })
  async updateOrder(@Param('id') id: number, @Body() order: UpdateOrderDto) {
    const orderDb = await this.orderService.getOrderById(Number(id));
    if (!orderDb) {
      throw new NotFoundException(`PUT - Order with id ${id} not found`);
    }

    return await this.orderService.updateOrder(Number(id), order);
  }
}
