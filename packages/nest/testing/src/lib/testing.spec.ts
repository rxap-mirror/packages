import { MockConfigServiceFactory } from './mock-config-service-factory';
import { MockLoggerFactory } from './mock-logger-factory';

describe('MockConfigServiceFactory', () => {
  it('returns configured values', () => {
    const c = MockConfigServiceFactory({ a: 1 });
    expect(c.get('a')).toBe(1);
    expect(c.get('missing')).toBeUndefined();
    expect(c.getOrThrow('a')).toBe(1);
  });

  it('getOrThrow throws for undefined keys', () => {
    expect(() => MockConfigServiceFactory().getOrThrow('x')).toThrow('Config key x is not defined');
  });

  it('set updates config', () => {
    const c = MockConfigServiceFactory();
    c.set('k', 'v');
    expect(c.get('k')).toBe('v');
    expect(c.getOrThrow('k')).toBe('v');
  });
});

describe('MockLoggerFactory', () => {
  it('provides jest mocks for all logger methods', () => {
    const l = MockLoggerFactory();
    for (const m of ['error', 'log', 'warn', 'debug', 'verbose'] as const) {
      l[m]('x');
      expect(l[m]).toHaveBeenCalledWith('x');
    }
  });
});
