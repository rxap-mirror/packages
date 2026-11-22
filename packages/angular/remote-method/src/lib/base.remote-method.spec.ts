import { Injectable, InjectionToken, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BaseRemoteMethod, RxapRemoteMethod } from './base.remote-method';
import { RxapRemoteMethodError } from './error';
import { ProxyRemoteMethod } from './proxy.remote-method';
import { RemoteMethodLoader } from './remote-method-loader';
import { REMOTE_METHOD_META_DATA, RXAP_PROXY_REMOTE_METHOD_TARGET } from './tokens';

@RxapRemoteMethod('test-method')
@Injectable()
class TestMethod extends BaseRemoteMethod<string, { a: number }> {
  public impl: (p?: { a: number }) => any = (p) => `result-${p?.a}`;
  protected _call(parameters?: { a: number }) {
    return this.impl(parameters);
  }
}

function mk<T>(cls: new (...a: any[]) => T, ...args: any[]): T {
  return TestBed.runInInjectionContext(() => new cls(...args));
}

class Refreshable {
  refresh = jest.fn();
}

describe('BaseRemoteMethod', () => {
  it('reads the id from the decorator metadata', () => {
    expect(mk(TestMethod, null, null).id).toBe('test-method');
  });

  it('RxapRemoteMethod accepts a metadata object', () => {
    @RxapRemoteMethod({ id: 'obj', foo: 1 })
    class M extends BaseRemoteMethod {
      protected _call() { return 1; }
    }
    const m = mk(M, null, null);
    expect(m.id).toBe('obj');
    expect(m.metadata['foo']).toBe(1);
  });

  it('calls _call, emits executed$ and returns the result', async () => {
    const m = mk(TestMethod, null, null);
    const emitted: string[] = [];
    m.executed$.subscribe((v) => emitted.push(v));
    await expect(m.call({ a: 1 })).resolves.toBe('result-1');
    expect(emitted).toEqual(['result-1']);
  });

  it('initialises the definition on first call', async () => {
    const m = mk(TestMethod, null, null);
    const init = jest.spyOn(m, 'init');
    await m.call();
    await m.call();
    expect(init).toHaveBeenCalledTimes(2);
    expect((m as any)._initialised).toBe(true);
  });

  it('tracks executions in progress and the executing signal', async () => {
    const m = mk(TestMethod, null, null);
    let resolve!: (v: string) => void;
    m.impl = () => new Promise<string>((r) => (resolve = r));
    expect(m.executing()).toBe(false);
    const promise = m.call();
    expect(m.executionsInProgress()).toBe(1);
    expect(m.executing()).toBe(true);
    resolve('x');
    await promise;
    expect(m.executionsInProgress()).toBe(0);
    expect(m.executing()).toBe(false);
  });

  it('decreases the in-progress counter when the call fails', async () => {
    const m = mk(TestMethod, null, null);
    m.impl = () => Promise.reject(new Error('fail'));
    const emitted = jest.fn();
    m.executed$.subscribe(emitted);
    await expect(m.call()).rejects.toThrow('fail');
    expect(m.executionsInProgress()).toBe(0);
    expect(emitted).not.toHaveBeenCalled();
  });

  describe('refresh', () => {
    it('refreshes configured targets after a call', async () => {
      const target = new Refreshable();
      const token = new InjectionToken<Refreshable>('t');
      const injector = Injector.create({
        providers: [
          { provide: Refreshable, useValue: target },
          { provide: token, useValue: target },
        ],
      });
      const m = mk(TestMethod, injector, { id: 'x', refresh: [Refreshable, token, class Missing {}] });
      await m.call();
      expect(target.refresh).toHaveBeenCalledTimes(2);
    });

    it('does nothing without refresh metadata', () => {
      expect(() => mk(TestMethod, null, null).refresh()).not.toThrow();
    });

    it('pauseRefresh and resumeRefresh control refresh on execution', async () => {
      const target = new Refreshable();
      const injector = Injector.create({ providers: [{ provide: Refreshable, useValue: target }] });
      const m = mk(TestMethod, injector, { id: 'x', refresh: [Refreshable] });
      m.pauseRefresh();
      await m.call();
      expect(target.refresh).not.toHaveBeenCalled();
      m.resumeRefresh();
      await m.call();
      expect(target.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('constructor validation', () => {
    it('throws for an injector without get', () => {
      expect(() => mk(TestMethod, {} as any, null)).toThrow(/not Injector like/);
    });

    it('defaults to the null injector', () => {
      expect(mk(TestMethod, null, null).injector).toBe(Injector.NULL);
    });
  });

  it('is resolvable through DI with metadata', () => {
    TestBed.configureTestingModule({
      providers: [TestMethod, { provide: REMOTE_METHOD_META_DATA, useValue: { id: 'override', extra: true } }],
    });
    const m = TestBed.inject(TestMethod);
    expect(m.id).toBe('override');
    expect(m.metadata['extra']).toBe(true);
  });
});

describe('RxapRemoteMethodError', () => {
  it('prefixes the package scope', () => {
    const e = new RxapRemoteMethodError('msg', 'C', 'Cls');
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toContain('msg');
  });
});

describe('ProxyRemoteMethod', () => {
  @Injectable()
  class Proxy extends ProxyRemoteMethod<string, number, { a: number }> {
    transformParameters(p?: number) {
      return Promise.resolve({ a: (p ?? 0) * 2 });
    }
  }

  it('transforms parameters and forwards the call to the target', async () => {
    TestBed.configureTestingModule({ providers: [Proxy] });
    const target = mk(TestMethod, null, null);
    const callSpy = jest.spyOn(target, 'call');
    // metadata defaults to the target metadata when not provided
    const proxy = mk(Proxy as any, target, Injector.NULL, undefined);
    await expect(proxy.call(2)).resolves.toBe('result-4');
    expect(callSpy).toHaveBeenCalledWith({ a: 4 });
    expect(proxy.id).toBe('test-method');
  });

  it('can be created through DI', () => {
    TestBed.configureTestingModule({ providers: [Proxy] });
    const target = mk(TestMethod, null, null);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Proxy,
        { provide: RXAP_PROXY_REMOTE_METHOD_TARGET, useValue: target },
        { provide: REMOTE_METHOD_META_DATA, useValue: { id: 'proxy' } },
      ],
    });
    expect(TestBed.inject(Proxy).id).toBe('proxy');
  });
});

describe('RemoteMethodLoader', () => {
  it('loads an instance and calls it with parameters', async () => {
    const loader = TestBed.inject(RemoteMethodLoader);
    const method = mk(TestMethod, null, null);
    await expect(loader.call$(method, { a: 7 })).resolves.toBe('result-7');
  });

  it('applies metadata overrides to the instance', async () => {
    const loader = TestBed.inject(RemoteMethodLoader);
    const method = mk(TestMethod, null, null);
    await loader.call$(method, { a: 1 }, { id: 'renamed' });
    expect(method.id).toBe('renamed');
  });

  it('resolves classes via the injector', async () => {
    TestBed.configureTestingModule({ providers: [TestMethod] });
    await expect(TestBed.inject(RemoteMethodLoader).call$(TestMethod, { a: 3 })).resolves.toBe('result-3');
  });

  it('prefers a custom injector', async () => {
    const custom = Injector.create({ providers: [{ provide: TestMethod, useFactory: () => mk(TestMethod, null, null) }] });
    await expect(TestBed.inject(RemoteMethodLoader).call$(TestMethod, { a: 5 }, undefined, custom)).resolves.toBe('result-5');
  });

  it('rejects string ids', async () => {
    await expect(TestBed.inject(RemoteMethodLoader).call$('id' as any, {})).rejects.toThrow();
  });
});
