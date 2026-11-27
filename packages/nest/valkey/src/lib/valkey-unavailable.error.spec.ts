import { ValkeyUnavailableError } from './valkey-unavailable.error';

describe('ValkeyUnavailableError', () => {
  it('is an Error with a stable name and code', () => {
    const error = new ValkeyUnavailableError('lock acquire(k)', new Error('ECONNREFUSED'));

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValkeyUnavailableError);
    expect(error.name).toBe('ValkeyUnavailableError');
    expect(error.code).toBe('VALKEY_UNAVAILABLE');
  });

  it('keeps the operation and the cause message', () => {
    const cause = new Error('ECONNREFUSED');
    const error = new ValkeyUnavailableError('lock acquire(k)', cause);

    expect(error.message).toContain('lock acquire(k)');
    expect(error.message).toContain('ECONNREFUSED');
    expect(error.operation).toBe('lock acquire(k)');
    expect((error as Error & { cause?: unknown }).cause).toBe(cause);
  });

  it('copes with a non-Error cause', () => {
    const error = new ValkeyUnavailableError('op', 'boom');

    expect(error.message).toContain('boom');
    expect((error as Error & { cause?: unknown }).cause).toBe('boom');
  });

  it('does not leak a password embedded in the cause message', () => {
    const error = new ValkeyUnavailableError(
      'op',
      new Error('connect failed redis://user:s3cret@host:6379')
    );

    expect(error.message).not.toContain('s3cret');
  });
});
