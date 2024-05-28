import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.save(createUserDto);
    return {
      data: newUser,
      message: 'User Created successfully',
    };
  }

  async findAll() {
    const res = await this.userRepository.find({});

    return {
      data: res,
      message: 'All Users Fetched successfully',
    };
  }
  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      ErrorHelper.NotFoundException(`User with ID ${id} not found`);
    }
    return {
      data: user,
      message: `User with ID ${id} fetched successfully`,
    };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      ErrorHelper.NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return {
      data: updatedUser,
      message: `User with ID ${id} updated successfully`,
    };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      ErrorHelper.NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
    return {
      message: `User with ID ${id} removed successfully`,
    };
  }
}
