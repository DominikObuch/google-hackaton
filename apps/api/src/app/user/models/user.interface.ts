import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id!: number;

  @ApiProperty({ example: 'John', description: 'The name of the user' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Doe', description: 'The surname of the user' })
  @IsString()
  surname!: string;

  @ApiProperty({ example: 1990, description: 'The birth year of the user' })
  @IsInt()
  birthYear!: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email!: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id'] as const) {}
export class UpdateUserDto extends OmitType(UserDto, ['id'] as const) {}
export class UpdateUserPartialDto extends PartialType(UpdateUserDto) {}
