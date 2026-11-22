import { ToMethod } from './method';

describe('ToMethod', () => {
  it('wraps a function into a method object', async () => {
    const fn = jest.fn((p?: number) => (p ?? 0) + 1);
    const method = ToMethod(fn);
    expect(method.call(1)).toBe(2);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('uses default metadata', () => {
    expect(ToMethod(() => 1).metadata).toEqual({ id: 'to-method' });
  });

  it('uses provided metadata', () => {
    expect(ToMethod(() => 1, { id: 'x' }).metadata).toEqual({ id: 'x' });
  });

  it('supports async functions', async () => {
    await expect(ToMethod(async () => 'a').call()).resolves.toBe('a');
  });
});
