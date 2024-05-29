import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientProvider,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { KAFKA_CLIENT } from 'src/constants/base.constants';

@Module({
  imports: [
    {
      global: true,
      ...ClientsModule.registerAsync([
        {
          name: KAFKA_CLIENT,
          inject: [ConfigService],
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  brokers: [configService.get<string>('KAFKA_BROKER')],
                },
                consumer: {
                  groupId: 'AUTH_SERVICE',
                },
              },
            }) as ClientProvider,
        },
      ]),
    },
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, ConfigService, User],
})
export class AuthModule {}
