import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RemoteMethodLoader } from '@rxap/remote-method';
import {
  RemoteMethodTemplateCollectionDirective,
  RemoteMethodTemplateCollectionDirectiveContext,
} from './remote-method-template-collection.directive';

@Component({
  standalone: true,
  imports: [RemoteMethodTemplateCollectionDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ng-template #emptyTpl><span id="empty">empty</span></ng-template>
    <ng-template #errorTpl let-message="message" let-name="name"><span id="error">{{ name }}:{{ message }}</span></ng-template>
    <ng-template
      rxapRemoteMethodCollection
      let-item
      let-index="index"
      let-first="first"
      let-last="last"
      let-even="even"
      let-odd="odd"
      let-count="count"
      [rxapRemoteMethodCollectionCall]="method"
      [rxapRemoteMethodCollectionParameters]="parameters()"
      [rxapRemoteMethodCollectionWithoutParameters]="withoutParameters()"
      [rxapRemoteMethodCollectionEmpty]="emptyTpl"
      [rxapRemoteMethodCollectionError]="errorTpl"
      [rxapRemoteMethodCollectionTrackBy]="trackBy"
    >
      <li class="item">{{ item.name }}|{{ index }}|{{ first }}|{{ last }}|{{ even }}|{{ odd }}|{{ count }}</li>
    </ng-template>
  `,
})
class HostComponent {
  method: any = 'list';
  parameters = signal<any>(undefined);
  withoutParameters = signal(false);
  trackBy: any = undefined;
}

describe('RemoteMethodTemplateCollectionDirective', () => {
  let call$: jest.Mock;
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const items = () =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.item')).map((e) => e.textContent);
  const flush = async () => {
    await new Promise<void>((r) => setTimeout(r));
    fixture.detectChanges();
  };
  const directive = () =>
    fixture.debugElement
      .queryAllNodes(By.directive(RemoteMethodTemplateCollectionDirective))[0]
      .injector.get(RemoteMethodTemplateCollectionDirective);

  beforeEach(() => {
    call$ = jest.fn().mockResolvedValue([{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
    jest.spyOn(console, 'warn').mockImplementation();
    TestBed.configureTestingModule({ providers: [{ provide: RemoteMethodLoader, useValue: { call$ } }] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });
  afterEach(() => jest.restoreAllMocks());

  it('does nothing until parameters are provided', async () => {
    fixture.detectChanges();
    await flush();
    expect(call$).not.toHaveBeenCalled();
    expect(items()).toEqual([]);
  });

  it('renders each item with the context helpers', async () => {
    host.withoutParameters.set(true);
    fixture.detectChanges();
    await flush();
    expect(items()).toEqual([
      'a|0|true|false|true|false|3',
      'b|1|false|false|false|true|3',
      'c|2|false|true|true|false|3',
    ]);
    expect(call$).toHaveBeenCalledWith('list', undefined, undefined, expect.anything());
  });

  it('calls the method with the bound parameters and re-renders on change', async () => {
    host.parameters.set({ page: 1 });
    fixture.detectChanges();
    await flush();
    expect(call$.mock.calls[0][1]).toEqual({ page: 1 });
    expect(items()).toHaveLength(3);
    call$.mockResolvedValue([{ name: 'x' }]);
    host.parameters.set({ page: 2 });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(call$.mock.calls[1][1]).toEqual({ page: 2 });
    expect(items()).toEqual(['x|0|true|true|true|false|1']);
  });

  it('shows the empty template for empty and non-array responses and removes it when data arrives', async () => {
    call$.mockResolvedValue([]);
    host.parameters.set({});
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('#empty')).not.toBeNull();
    expect(items()).toEqual([]);

    call$.mockResolvedValue(null);
    host.parameters.set({ n: 1 });
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('#empty')).not.toBeNull();

    call$.mockResolvedValue([{ name: 'z' }]);
    host.parameters.set({ n: 2 });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#empty')).toBeNull();
    expect(items()).toHaveLength(1);
  });

  it('shows the error template when the call fails', async () => {
    const error = new Error('bad');
    error.name = 'MyError';
    call$.mockRejectedValue(error);
    host.parameters.set({});
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('#error').textContent).toBe('MyError:bad');
    expect(items()).toEqual([]);
  });

  it('recovers from an error after a successful call', async () => {
    call$.mockRejectedValueOnce(new Error('bad'));
    host.parameters.set({ n: 1 });
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('#error')).not.toBeNull();
    call$.mockResolvedValue([{ name: 'ok' }]);
    host.parameters.set({ n: 2 });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#error')).toBeNull();
    expect(items()).toEqual(['ok|0|true|true|true|false|1']);
  });

  it('keeps existing views stable with a trackBy function', async () => {
    host.trackBy = (_: number, item: any) => item.name;
    call$.mockResolvedValue([{ name: 'a' }, { name: 'b' }]);
    host.parameters.set({ n: 1 });
    fixture.detectChanges();
    await flush();
    const first = fixture.nativeElement.querySelector('.item');
    call$.mockResolvedValue([{ name: 'a' }, { name: 'c' }, { name: 'b' }]);
    host.parameters.set({ n: 2 });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.item')).toBe(first);
    expect(items().map((i) => i!.split('|')[0])).toEqual(['a', 'c', 'b']);
  });

  it('warns about a non-function trackBy in dev mode', () => {
    host.trackBy = 'nope';
    fixture.detectChanges();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('trackBy must be a function'));
  });

  it('exposes a context guard and a context class with helpers', () => {
    expect(RemoteMethodTemplateCollectionDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
    const ctx = new RemoteMethodTemplateCollectionDirectiveContext('x', 1, 2);
    expect([ctx.first, ctx.last, ctx.even, ctx.odd]).toEqual([false, true, false, true]);
    host.withoutParameters.set(true);
    fixture.detectChanges();
    expect(directive()).toBeTruthy();
  });
});
