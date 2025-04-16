import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',               // ✅ allow all origins
      credentials: true,         // ✅ allow cookies if needed
    },
  });

   // Global validation
   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
   app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'], // Docker internal address
      },
      consumer: {
        groupId: 'user-consumer',
      },
    },
  });

  await app.startAllMicroservices();
   // Swagger setup
   const config = new DocumentBuilder()
     .setTitle('User Service API')
     .setDescription('CRUD operations for users')
     .setVersion('1.0')
     .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api', app, document);
 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
