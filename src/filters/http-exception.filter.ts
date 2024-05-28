import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse() as any;

    const trasnformMessage = () => {
      if (typeof exceptionResponse?.message === 'string') {
        return [exceptionResponse?.message];
      } else if (Array.isArray(exceptionResponse?.message)) {
        return exceptionResponse?.message;
      } else if (typeof exceptionResponse === 'string') {
        return [exceptionResponse];
      } else {
        return ['Something went wrong'];
      }
    };

    response.status(status).json({
      success: false,
      message: exception.message,
      errors: trasnformMessage(),
    });
  }
}
