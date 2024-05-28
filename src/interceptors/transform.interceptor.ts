import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { IResponse } from 'src/interfaces/response.interface';

@Injectable()
export class LoggerInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  constructor(
    private readonly config: {
      redirect?: boolean;
    } = {},
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, ip, url } = request;
    const timestamp = new Date().toISOString();

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log(
            `info ${timestamp} ip: ${ip} method: ${method} url: ${url}`,
          ),
        ),
      );
  }
}
