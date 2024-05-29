import * as otpGenerator from 'otp-generator';
import * as jwt from 'jsonwebtoken';
import { ErrorHelper } from './error.utils';

/**
 * Token helper
 */
export class TokenHelper {
  /**
   * Signs token helper
   * @param payload - your json object
   * @param secret - your private hash
   * @param expiresIn - seconds
   * @returns
   */
  static generate(
    payload: Record<string, any>,
    secret: string,
    expiresIn: string,
  ): {
    token: string;
    expires: number;
  } {
    expiresIn = '14d';

    const token = jwt.sign(payload, secret, {
      expiresIn,
    });
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    return {
      token,
      expires: decoded.iat,
    };
  }

  /**
   * Verifys token helper
   * @param token
   * @param secret
   */
  static verify<T>(token: string, secret: string, opts?: jwt.VerifyOptions): T {
    try {
      const options: jwt.VerifyOptions = {
        ...opts,
        algorithms: ['HS256'],
      };
      const payload = jwt.verify(token, secret, options);
      return payload as any;
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        ErrorHelper.UnauthorizedException('Access token expired');
      if (error.name === 'JsonWebTokenError')
        ErrorHelper.UnauthorizedException('Access token not valid');
      throw error;
    }
  }

  /**
   * generates a random string token
   * @param size
   * @returns string
   */
  static generateRandomString(size = 21): string {
    return otpGenerator.generate(size, {
      digits: true,
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: false,
    });
  }
}
