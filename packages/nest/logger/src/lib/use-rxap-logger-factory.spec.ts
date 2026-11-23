import { INestApplicationContext } from '@nestjs/common';
import { RxapLogger } from './logger';
import { UseRxapLoggerFactory } from './use-rxap-logger-factory';

describe('UseRxapLoggerFactory', () => {

  it('should resolve the RxapLogger from the application context', () => {
    const logger = new RxapLogger();
    const app = { get: jest.fn().mockReturnValue(logger) } as unknown as INestApplicationContext;
    const factory = UseRxapLoggerFactory();
    expect(factory(app)).toBe(logger);
    expect(app.get).toHaveBeenCalledWith(RxapLogger);
  });

});
