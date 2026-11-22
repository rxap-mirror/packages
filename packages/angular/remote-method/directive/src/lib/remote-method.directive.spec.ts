import { Component, Directive, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodDirective } from './remote-method.directive';
import { RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN } from './tokens';

@Component({
  standalone: true,
  imports: [RemoteMethodDirective],
  template: `
    <button
      id="btn"
      [rxapRemoteMethod]="method()"
      [parameters]="parameters()"
      [metadata]="metadata()"
      [immediately]="immediately()"
      [rxapConfirm]="confirm()"
      (executed)="executed.push($event)"
      (successful)="successful.push($event)"
      (failure)="failure.push($event)"
      #dir="rxapRemoteMethod"
    ></button>
  `,
})
class HostComponent {
  method = signal<any>('my-method');
  parameters = signal<any>(undefined);
  metadata = signal<any>(undefined);
  immediately = signal(false);
  confirm = signal<any>(false);
  executed: unknown[] = [];
  successful: unknown[] = [];
  failure: unknown[] = [];
}

@Directive({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[withToken]',
  providers: [{ provide: RXAP_REMOTE_METHOD_DIRECTIVE_TOKEN, useValue: 'from-token' }],
})
class TokenProviderDirective {}

@Component({
  standalone: true,
  imports: [RemoteMethodDirective, TokenProviderDirective],
  template: `<button withToken rxapRemoteMethod></button>`,
})
class TokenHostComponent {}

describe('RemoteMethodDirective', () => {
  let call$: jest.Mock;
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const button = () => fixture.nativeElement.querySelector('#btn') as HTMLButtonElement;
  const directive = () =>
    fixture.debugElement.children[0].injector.get(RemoteMethodDirective);
  const flush = () => new Promise<void>((r) => setTimeout(r));

  beforeEach(() => {
    call$ = jest.fn().mockResolvedValue('result');
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });
  afterEach(() => jest.restoreAllMocks());

  it('executes on click with the bound inputs and emits outputs', async () => {
    host.parameters.set({ a: 1 });
    host.metadata.set({ id: 'm' });
    fixture.detectChanges();
    button().click();
    await flush();
    expect(call$).toHaveBeenCalledWith('my-method', { a: 1 }, { id: 'm' }, expect.anything());
    expect(host.executed).toEqual(['result']);
    expect(host.successful).toEqual(['result']);
    expect(host.failure).toEqual([]);
  });

  it('toggles executing$ while running', async () => {
    let resolve!: (v: string) => void;
    call$.mockReturnValue(new Promise((r) => (resolve = r)));
    fixture.detectChanges();
    const states: boolean[] = [];
    directive().executing$.subscribe((v: boolean) => states.push(v));
    button().click();
    expect(states.at(-1)).toBe(true);
    resolve('x');
    await flush();
    expect(states.at(-1)).toBe(false);
  });

  it('emits failure and disables executing on errors', async () => {
    const error = new Error('boom');
    call$.mockRejectedValue(error);
    fixture.detectChanges();
    button().click();
    await flush();
    expect(host.failure).toEqual([error]);
    expect(host.successful).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Remote method directive execution failed:', 'boom');
  });

  it('executes immediately on init when requested', async () => {
    host.immediately.set(true);
    fixture.detectChanges();
    await flush();
    expect(call$).toHaveBeenCalledTimes(1);
  });

  it('skips click execution while a confirm directive is present', async () => {
    host.confirm.set('');
    fixture.detectChanges();
    button().click();
    await flush();
    expect(call$).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
    button().dispatchEvent(new CustomEvent('confirmed'));
    await flush();
    expect(call$).toHaveBeenCalledTimes(1);
  });

  describe('parameters (linkedSignal)', () => {
    it('merges set parameters on top of the bound parameters', async () => {
      host.parameters.set({ a: 1, b: 1 });
      fixture.detectChanges();
      directive().setParameter('b', 2);
      directive().updateParameters({ c: 3 });
      await directive().execute();
      expect(call$.mock.calls[0][1]).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('works without bound parameters', async () => {
      fixture.detectChanges();
      directive().setParameter('x', 1);
      await directive().execute();
      expect(call$.mock.calls[0][1]).toEqual({ x: 1 });
    });

    it('resets local changes when the bound parameters change', async () => {
      host.parameters.set({ a: 1 });
      fixture.detectChanges();
      directive().setParameter('b', 2);
      host.parameters.set({ a: 5 });
      fixture.detectChanges();
      await directive().execute();
      expect(call$.mock.calls[0][1]).toEqual({ a: 5 });
    });
  });

  it('falls back to the injected token when no method is bound', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    const f = TestBed.createComponent(TokenHostComponent);
    f.detectChanges();
    const dir = f.debugElement.children[0].injector.get(RemoteMethodDirective);
    await dir.execute();
    expect(call$.mock.calls[0][0]).toBe('from-token');
  });

  it('uses the new method when the bound input changes', async () => {
    fixture.detectChanges();
    host.method.set('other');
    fixture.detectChanges();
    await directive().execute();
    expect(call$.mock.calls[0][0]).toBe('other');
  });

  it('the deprecated call() delegates to the loader', async () => {
    fixture.detectChanges();
    await expect((directive() as any).call()).resolves.toBe('result');
    expect(call$).toHaveBeenCalledTimes(1);
  });
});
