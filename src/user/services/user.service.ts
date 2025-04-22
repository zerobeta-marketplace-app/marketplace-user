import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '../../kafka/kafka.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); 
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(role?: string): Promise<User[]> {
    if (role) {
      return this.userRepository.find({ where: { role: role as 'buyer' | 'seller' } });
    }
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException('User not found');
    console.log('User found:', user);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  @MessagePattern('get-user-by-email')
  async handleGetUserByEmail(@Payload() message: any) {
    console.log('Kafka message received:', message);
    const email = message.value;
    console.log('Looking for email:', email);
    
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      console.dir(user, { depth: null });
      //return JSON.stringify(user);
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      throw new NotFoundException('User not found');
    }
  }
}

