import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPartialDto,
  UserDto,
} from './models/user.interface';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserDto],
  })
  async getAll() {
    return await this.userService.getAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name' })
  @ApiQuery({ name: 'name', description: 'The name of the user to search for' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching the search criteria',
    type: [UserDto],
  })
  async searchByName(@Query('name') name: string) {
    const users = await this.userService.searchUsersByName(name);
    if (users.length === 0) {
      throw new NotFoundException(`Users with name ${name} not found`);
    }
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the user' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified id',
    type: UserDto,
  })
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.getUserById(Number(id));
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the user' })
  @ApiResponse({
    status: 200,
    description: 'The user with the specified id has been deleted',
    type: Number,
  })
  async deleteUser(@Param('id') id: number) {
    const user = await this.userService.getUserById(Number(id));
    if (!user) {
      throw new NotFoundException(`DELETE - User with id ${id} not found`);
    }

    return await this.userService.deleteUser(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data to create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: UserDto,
  })
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.createUser(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the user' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The fields to update in the user',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: UserDto,
  })
  async updateUser(@Param('id') id: number, @Body() user: UpdateUserDto) {
    const userDb = await this.userService.getUserById(Number(id));
    if (!userDb) {
      throw new NotFoundException(`PUT - User with id ${id} not found`);
    }

    return await this.userService.updateUser(Number(id), user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a user by id' })
  @ApiParam({ name: 'id', description: 'The unique identifier of the user' })
  @ApiBody({
    type: UpdateUserPartialDto,
    description: 'The fields to update in the user',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: UserDto,
  })
  async updateUserPartially(
    @Param('id') id: number,
    @Body() user: UpdateUserPartialDto,
  ) {
    const userDb = await this.userService.getUserById(Number(id));
    if (!userDb) {
      throw new NotFoundException(`PATCH - User with id ${id} not found`);
    }
    return await this.userService.updateUser(Number(id), user);
  }
}
