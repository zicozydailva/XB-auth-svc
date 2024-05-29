import { Inject, Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/helpers';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { TokenHelper } from 'src/helpers/token.helper';
import { ConfigService } from '@nestjs/config';
import { EncryptHelper } from 'src/helpers/encrypt.helper';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT } from 'src/constants/base.constants';
import { firstValueFrom } from 'rxjs';
import { IUser } from 'src/interfaces/user.interface';
import { USER_CREATED } from 'src/constants';
import { classToPlain } from 'class-transformer';

type UserEventPayload = {
  user: IUser;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    @Inject(KAFKA_CLIENT) private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  async signUp(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    await this.notifyExternalService(USER_CREATED, { user: user.data });

    const tokenInfo = await this.generateAndSaveToken(user.data);

    return { tokenInfo };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    await EncryptHelper.hash(password);

    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      ErrorHelper.BadRequestException('Invalid credentials');
    }

    const secret = this.configService.get('APP_SECRET');
    const expiresIn = this.configService.get('ACCESS_TOKEN_EXPIRES');
    const sessionId = 'sessionId';

    const payload = { email: user.email, sub: user.id };
    const { token: accessToken, expires } = TokenHelper.generate(
      {
        sessionId,
        ...payload,
      },
      secret,
      expiresIn,
    );

    return {
      user: classToPlain(user),
      accessToken,
      expires,
    };
  }

  private async generateAndSaveToken(user: IUser) {
    const payload = { ...user, password: null };

    const secret = this.configService.get('APP_SECRET');
    const expiresIn = this.configService.get('ACCESS_TOKEN_EXPIRES');

    // const sessionId = await this.userSessionService.create(payload);

    const { token: accessToken, expires } = TokenHelper.generate(
      {
        sessionId: 'sessionId',
        ...payload,
      },
      secret,
      expiresIn,
    );
    const refreshToken = TokenHelper.generateRandomString(50);

    return {
      token: {
        accessToken,
        expires,
        refreshToken,
      },
      user: payload,
    };
  }

  async notifyExternalService(event: string, userPayload: UserEventPayload) {
    const payload = {
      id: userPayload.user.id,
      firstName: userPayload.user.firstName,
      lastName: userPayload.user.lastName,
      email: userPayload.user.email,
    };

    await firstValueFrom(this.kafkaClient.emit(event, payload));
  }

  // async syncUsers(type: 'user_event' | 'get_sub') {
  //   const allUsers = await this.userRepository.find();

  //   const result = await Promise.allSettled(
  //     allUsers.map(async (user) => {
  //       if (type === 'user_event') {
  //         return await this.notifyExternalService(USER_CREATED, { user });
  //       }
  //     }),
  //   );

  //   return {
  //     success: true,
  //     result,
  //   };
  // }
}
