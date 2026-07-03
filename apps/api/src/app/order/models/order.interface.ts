import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class OrderDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the order',
  })
  id!: number;

  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  userId!: number;

  @ApiProperty({ example: 'Keyboard', description: 'The name of the product' })
  @IsString()
  productName!: string;

  @ApiProperty({ example: 3, description: 'The product quantity' })
  @IsInt()
  quantity!: number;

  @ApiProperty({
    example: 299.9,
    description: 'The email of the user',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;
}

export class CreateOrderDto extends OmitType(OrderDto, ['id'] as const) {}
export class UpdateOrderDto extends OmitType(OrderDto, ['id'] as const) {}
