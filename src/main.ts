import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters';
import { LoggerInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.use(cors({}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggerInterceptor());

  const KAFKA_BROKER = configService.get<string>(
    'KAFKA_BROKER',
    '127.0.0.1:9092',
  );

  const microservice = app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_BROKER],
      },
      consumer: {
        groupId: 'AUTH_MS',
      },
    },
  });

  // await app.listen(3000);
  // global config
  app.setGlobalPrefix('/api');
  await app.listen(configService.get<string>('PORT'));

  await microservice.listen();
}
bootstrap();
