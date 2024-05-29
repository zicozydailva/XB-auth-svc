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

    return user;
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
    // const sessionId = await this.userSessionService.create(payload);
    const sessionId = 'await this.userSessionService.create(payload)';

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
      accessToken,
      expires,
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
}
