/* eslint-disable @typescript-eslint/no-throw-literal */
import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Catch(RpcException)
export class KafkaExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(KafkaExceptionFilter.name);

  catch(exception: RpcException): Observable<any> {
    this.logger.warn(exception);
    throw exception.getError();
  }
}
