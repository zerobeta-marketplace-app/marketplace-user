// src/user/user.controller.ts
import {
    Controller, Post, Body, Get, Param, Put, Query,Logger
  } from '@nestjs/common';
  import { UserService } from '../services/user.service';
  import { CreateUserDto } from '../dto/create-user.dto';
  import { UpdateUserDto } from '../dto/update-user.dto';
  import { ApiTags, ApiQuery } from '@nestjs/swagger';
  import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
  
  @ApiTags('Users')
  @Controller('users')
  export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService) {
      this.logger.log('User Controller initialized');
    }

    @MessagePattern('get-user-by-email')
  async getUserByEmail(@Payload() message: any) {
    this.logger.log(`Message pattern 'get-user-by-email' received: ${JSON.stringify(message)}`);
    
    try {
      let email;
      if (typeof message === 'string') {
        email = message;
      } else if (message && message.value) {
        email = message.value;
      } else {
        this.logger.error(`Invalid message format: ${JSON.stringify(message)}`);
        throw new Error('Invalid message format');
      }
      
      this.logger.log(`Looking for user with email: ${email}`);
      const user = await this.userService.findByEmail(email);
      this.logger.log(`User found: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @EventPattern('auth-test-topic')
  handleTestEvent(data: any) {
    this.logger.log(`Received test event: ${JSON.stringify(data)}`);
  }
  
  @EventPattern('auth-test-message')
  handleAuthTestMessage(data: any) {
    this.logger.log(`Received auth test message: ${JSON.stringify(data)}`);
  }

  
    @Post()
    create(@Body() dto: CreateUserDto) {
      return this.userService.create(dto);
    }
  
    @Get()
    @ApiQuery({ name: 'role', required: false })
    findAll(@Query('role') role?: string) {
      return this.userService.findAll(role);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.userService.findOne(+id);
    }
  
    @Get('/email/:email')
    findByEmail(@Param('email') email: string) {
      return this.userService.findByEmail(email);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
      return this.userService.update(+id, dto);
    }
  }
  