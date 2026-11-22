import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FirestoreErrorHandler } from './error-handler';

describe('FirestoreErrorHandler', () => {
  const logger = { error: jest.fn(), debug: jest.fn() } as any;
  const handler = FirestoreErrorHandler<any>(logger);

  beforeEach(() => jest.clearAllMocks());

  it('maps code 2 to an internal server error', () => {
    expect(() => handler({ message: 'm', note: 'n', code: 2, details: 'd' })).toThrow(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalledWith('m: n');
  });

  it('maps code 5 to not found', () => {
    expect(() => handler({ message: 'm', code: 5 })).toThrow(NotFoundException);
  });

  it('maps unknown codes to internal server error with the message', () => {
    try {
      handler({ message: 'boom', code: 99, details: 'd' });
      fail('should throw');
    } catch (e: any) {
      expect(e).toBeInstanceOf(InternalServerErrorException);
      expect(e.message).toBe('boom');
    }
    expect(logger.debug).toHaveBeenCalledWith('Error code: 99 is not handled');
  });
});
