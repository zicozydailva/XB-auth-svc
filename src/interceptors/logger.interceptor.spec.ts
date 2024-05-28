import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { LoggerInterceptor } from '.';

const redirect = jest.fn();

const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getRequest: jest.fn().mockResolvedValue({
    method: 'GET',
    ip: '::1',
    url: '/users',
  }),
  getResponse: jest.fn().mockImplementation(() => ({
    redirect,
  })),
}));

const mockArgumentsHost = {
  getClass: jest.fn(),
  getHandler: jest.fn(),
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

let mockPipe = jest.fn().mockImplementation(() => {
  const d = {
    data: {
      id: 1,
      name: 'John Doe',
    },
    status: 200,
    message: 'OK',
  };

  return new Observable((observer) => {
    observer.next(d);
    observer.complete();
  });
});

const mockNext = {
  handle: jest.fn().mockImplementation(() => ({
    pipe: mockPipe,
  })),
};

describe('Bad Request Exception Filter', () => {
  let interceptor: LoggerInterceptor<any>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerInterceptor,
          useValue: new LoggerInterceptor(),
        },
      ],
    }).compile();

    interceptor = module.get(LoggerInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform a request response', () => {
    const result = interceptor.intercept(mockArgumentsHost, mockNext);
    expect(mockNext.handle).toBeCalled();
    expect(mockPipe).toBeCalledWith(expect.any(Function));
    expect(result).toBeInstanceOf(Observable);
  });
});
