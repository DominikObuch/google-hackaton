import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPartialDto,
  UserDto,
} from './models/user.interface';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './db/user.model';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getAll(): Promise<UserDto[]> {
    const users = await this.userModel.findAll();

    return users.map((user) => {
      return this.mapDbModelToDto(user);
    });
  }

  async getUserById(id: number): Promise<UserDto | undefined> {
    const user = await this.userModel.findOne({
      where: {
        id: id,
      },
    });

    return user ?? undefined;
  }

  async searchUsersByName(name: string): Promise<UserDto[]> {
    return await this.userModel.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
    });
  }

  async deleteUser(id: number): Promise<number> {
    return this.userModel.destroy({
      where: {
        id: id,
      },
    });
  }

  async createUser(user: CreateUserDto): Promise<UserDto> {
    const createdUser = await this.userModel.create({
      name: user.name,
      surname: user.surname,
      email: user.email,
      birthYear: user.birthYear,
    });

    return this.mapDbModelToDto(createdUser);
  }

  async updateUser(
    id: number,
    user: UpdateUserDto | UpdateUserPartialDto,
  ): Promise<UserDto | undefined> {
    const result = await this.userModel.update(user, {
      where: {
        id: id,
      },
    });

    if (result[0] === 0) {
      return undefined;
    }

    const item = await this.userModel.findByPk(id);

    return item ? this.mapDbModelToDto(item) : undefined;
  }

  private mapDbModelToDto(model: User): UserDto {
    return {
      id: model.id,
      name: model.name,
      surname: model.surname,
      email: model.email,
      birthYear: model.birthYear,
    };
  }
}
