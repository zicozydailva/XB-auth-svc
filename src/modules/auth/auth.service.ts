import { Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/helpers';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto } from '../user/dto/create-user.dto';
import { TokenHelper } from 'src/helpers/token.helper';
import { ConfigService } from '@nestjs/config';
import { EncryptHelper } from 'src/helpers/encrypt.helper';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
}
