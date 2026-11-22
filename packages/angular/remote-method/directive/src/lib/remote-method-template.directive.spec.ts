import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RemoteMethodLoader } from '@rxap/remote-method';
import { RemoteMethodTemplateDirective } from './remote-method-template.directive';

@Component({
  standalone: true,
  imports: [RemoteMethodTemplateDirective],
  template: `
    <ng-template #loadingTpl><span id="loading">loading</span></ng-template>
    <ng-template #errorTpl let-message="message"><span id="error">{{ message }}</span></ng-template>
    <ng-template
      rxapRemoteMethod
      let-data
      [rxapRemoteMethodCall]="method()"
      [rxapRemoteMethodParameters]="parameters()"
      [rxapRemoteMethodMetadata]="metadata()"
      [rxapRemoteMethodWithoutParameters]="withoutParameters()"
      [rxapRemoteMethodLoading]="useLoading() ? loadingTpl : undefined"
      [rxapRemoteMethodError]="errorTpl"
      (executed)="executed.push($event)"
      (successful)="successful.push($event)"
      (failure)="failure.push($event)"
      (embedded)="embedded = embedded + 1"
    >
      <span id="data">{{ render(data) }}</span>
    </ng-template>
  `,
})
class HostComponent {
  method = signal<any>('m');
  parameters = signal<any>(undefined);
  metadata = signal<any>(undefined);
  withoutParameters = signal(false);
  useLoading = signal(false);
  executed: unknown[] = [];
  successful: unknown[] = [];
  failure: unknown[] = [];
  embedded = 0;
  render: (d: any) => string = (d) => JSON.stringify(d);
  readonly loadingTpl = viewChild<TemplateRef<any>>('loadingTpl');
}

describe('RemoteMethodTemplateDirective', () => {
  let call$: jest.Mock;
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const text = (id: string) => fixture.nativeElement.querySelector('#' + id)?.textContent;
  const flush = async () => {
    await new Promise<void>((r) => setTimeout(r));
    fixture.detectChanges();
  };
  const directive = (): RemoteMethodTemplateDirective =>
    fixture.debugElement.queryAllNodes(By.directive(RemoteMethodTemplateDirective))[0].injector.get(
      RemoteMethodTemplateDirective,
    );

  beforeEach(() => {
    call$ = jest.fn().mockResolvedValue({ v: 1 });
    jest.spyOn(console, 'error').mockImplementation();
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });
  afterEach(() => jest.restoreAllMocks());

  it('does not call the method until parameters are provided', async () => {
    fixture.detectChanges();
    await flush();
    expect(call$).not.toHaveBeenCalled();
    expect(text('data')).toBeUndefined();
  });

  it('executes without parameters when configured', async () => {
    host.withoutParameters.set(true);
    fixture.detectChanges();
    await flush();
    expect(call$).toHaveBeenCalledTimes(1);
    expect(call$.mock.calls[0][0]).toBe('m');
    expect(text('data')).toBe('{"v":1}');
    expect(host.executed).toEqual([{ v: 1 }]);
    expect(host.successful).toEqual([{ v: 1 }]);
    expect(host.embedded).toBe(1);
  });

  it('executes whenever the bound parameters change and re-renders', async () => {
    host.parameters.set({ id: 1 });
    fixture.detectChanges();
    await flush();
    expect(call$.mock.calls[0][1]).toEqual({ id: 1 });
    call$.mockResolvedValue({ v: 2 });
    host.parameters.set({ id: 2 });
    fixture.detectChanges();
    await flush();
    expect(call$).toHaveBeenCalledTimes(2);
    expect(call$.mock.calls[1][1]).toEqual({ id: 2 });
    expect(text('data')).toBe('{"v":2}');
    expect(fixture.nativeElement.querySelectorAll('#data')).toHaveLength(1);
  });

  it('passes metadata to the loader', async () => {
    host.metadata.set({ id: 'meta' });
    host.parameters.set({});
    fixture.detectChanges();
    await flush();
    expect(call$.mock.calls[0][2]).toEqual({ id: 'meta' });
  });

  it('shows the loading template while pending', async () => {
    let resolve!: (v: unknown) => void;
    call$.mockReturnValue(new Promise((r) => (resolve = r)));
    host.useLoading.set(true);
    host.parameters.set({});
    fixture.detectChanges();
    expect(text('loading')).toBe('loading');
    resolve('done');
    await flush();
    expect(text('loading')).toBeUndefined();
    expect(text('data')).toBe('"done"');
  });

  it('emits failure when the call rejects', async () => {
    const error = new Error('nope');
    call$.mockRejectedValue(error);
    host.parameters.set({});
    fixture.detectChanges();
    await flush();
    expect(host.failure).toEqual([error]);
    expect(host.successful).toEqual([]);
  });

  it('emits failure when rendering the result throws during change detection', async () => {
    host.render = () => {
      throw new Error('render failed');
    };
    host.parameters.set({});
    fixture.detectChanges();
    await flush().catch(() => undefined);
    expect(host.failure.length).toBe(1);
    expect((host.failure[0] as Error).message).toBe('render failed');
  });

  it('renders the error template when creating the embedded view throws', async () => {
    host.withoutParameters.set(true);
    fixture.detectChanges();
    await flush();
    const dir = directive();
    (dir as any).template = {
      createEmbeddedViewImpl: () => {
        throw new Error('create failed');
      },
    };
    (dir as any).renderTemplate({ v: 1 });
    fixture.detectChanges();
    expect(text('error')).toBe('create failed');
    expect(console.error).toHaveBeenCalledWith('create failed');
  });

  it('setParameter and updateParameters merge into the current parameters', async () => {
    host.parameters.set({ a: 1 });
    fixture.detectChanges();
    await flush();
    const dir = directive();
    dir.setParameter('b', 2);
    dir.updateParameters({ c: 3 });
    await dir.execute();
    expect(call$.mock.calls.at(-1)![1]).toEqual({ a: 1, b: 2, c: 3 });
    host.parameters.set({ a: 9 });
    fixture.detectChanges();
    await flush();
    expect(call$.mock.calls.at(-1)![1]).toEqual({ a: 9 });
  });

  it('the deprecated call() executes with the given parameters', async () => {
    host.parameters.set({});
    fixture.detectChanges();
    await flush();
    directive().call({ z: 1 });
    await flush();
    expect(call$.mock.calls.at(-1)![1]).toEqual({ z: 1 });
  });

  it('falls back to the injected token', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.method.set(undefined);
    fixture.componentInstance.withoutParameters.set(true);
    fixture.detectChanges();
    await flush();
    expect(call$.mock.calls[0][0]).toBeNull();
  });

  it('exposes a template context guard', () => {
    expect(RemoteMethodTemplateDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
  });
});
