import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BaseRemoteMethod, RemoteMethodLoader, RxapRemoteMethod } from '@rxap/remote-method';
import { REMOTE_METHOD_TESTING_LOADER_PROVIDER, RemoteMethodTestingLoader } from './remote-method-testing-loader';

@RxapRemoteMethod('real')
@Injectable()
class Real extends BaseRemoteMethod<string> {
  protected _call() { return 'real'; }
}

describe('RemoteMethodTestingLoader', () => {
  let loader: RemoteMethodTestingLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [REMOTE_METHOD_TESTING_LOADER_PROVIDER, Real] });
    loader = TestBed.inject(RemoteMethodLoader) as RemoteMethodTestingLoader;
  });

  it('is provided in place of the RemoteMethodLoader', () => {
    expect(loader).toBeInstanceOf(RemoteMethodTestingLoader);
  });

  it('returns static mock values', async () => {
    loader.mock('a', { v: 1 });
    expect(loader.hasMock('a')).toBe(true);
    await expect(loader.call$('a')).resolves.toEqual({ v: 1 });
  });

  it('calls mock functions with parameters and metadata', async () => {
    const fn = vi.fn().mockResolvedValue('r');
    loader.mock('a', fn);
    await expect(loader.call$('a', { p: 1 }, { id: 'a' })).resolves.toBe('r');
    expect(fn).toHaveBeenCalledWith({ p: 1 }, { id: 'a' });
    expect(loader.getMock('a')).toBe(fn);
  });

  it('deletes and clears mocks', () => {
    loader.mock('a', 1);
    loader.mock('b', 2);
    expect(loader.deleteMock('a')).toBe(true);
    expect(loader.deleteMock('a')).toBe(false);
    loader.clearMocks();
    expect(loader.hasMock('b')).toBe(false);
    expect(() => loader.getMock('b')).toThrow(/not registered/);
  });

  it('falls back to the real loader for non-mocked ids and instances', async () => {
    await expect(loader.call$('unknown')).rejects.toThrow();
    await expect(loader.call$(TestBed.inject(Real))).resolves.toBe('real');
  });
});
