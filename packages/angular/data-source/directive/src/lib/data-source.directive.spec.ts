import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ObservableDataSource } from '@rxap/data-source';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataSourceDirective } from './data-source.directive';

@Component({
  imports: [DataSourceDirective],
  template: `
    <ng-template #errorTpl let-error let-refresh="refresh">
      <span id="error">{{ error?.message ?? 'flag' }}</span><button id="refresh" (click)="refresh()">r</button>
    </ng-template>
    <ng-template
      rxapDataSource
      let-data
      [rxapDataSourceFrom]="source()"
      [rxapDataSourceErrorTemplate]="errorTpl"
      [rxapDataSourceTrackBy]="trackBy"
      (embedded)="embedded.push($event)"
      (error)="errors.push($event)"
    >
      <span id="data">{{ data?.name }}</span>
    </ng-template>
  `,
})
class HostComponent {
  source = signal<any>(null);
  trackBy: any = (d: any) => d?.id;
  embedded: unknown[] = [];
  errors: unknown[] = [];
}

describe('DataSourceDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let data$: BehaviorSubject<any>;
  let ds: ObservableDataSource<any>;

  const text = (id: string) => fixture.nativeElement.querySelector('#' + id)?.textContent;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const directive = () =>
    fixture.debugElement.queryAllNodes(By.directive(DataSourceDirective))[0].injector.get(DataSourceDirective);

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    data$ = new BehaviorSubject({ id: 1, name: 'one' });
    ds = new ObservableDataSource<any>(data$, { id: 'obs' });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.source.set(ds);
  });
  afterEach(() => jest.restoreAllMocks());

  it('embeds the template with the emitted data after the first render', async () => {
    expect(text('data')).toBeUndefined();
    await settle();
    expect(text('data')).toBe('one');
    expect(host.embedded).toEqual([{ id: 1, name: 'one' }]);
  });

  it('reuses the view when the trackBy key is unchanged and replaces it otherwise', async () => {
    await settle();
    const view = fixture.nativeElement.querySelector('#data');
    data$.next({ id: 1, name: 'one-changed' });
    await settle();
    expect(fixture.nativeElement.querySelector('#data')).toBe(view);
    data$.next({ id: 2, name: 'two' });
    await settle();
    expect(fixture.nativeElement.querySelector('#data')).not.toBe(view);
    expect(text('data')).toBe('two');
  });

  it('loads a data source by token from the injector', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: ObservableDataSource, useValue: ds }] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.source.set(ObservableDataSource);
    await settle();
    expect(text('data')).toBe('one');
  });

  it('renders the error template and emits on connection errors', async () => {
    const failing = new Subject<any>();
    host.source.set(new ObservableDataSource<any>(failing, { id: 'f' }));
    await settle();
    failing.error(new Error('bad'));
    await settle();
    expect(host.errors).toHaveLength(1);
    expect(text('error')).toBe('bad');
    expect(text('data')).toBeUndefined();
  });

  it('shows the error template for the hasError flag and removes it again', async () => {
    await settle();
    ds.hasError$.enable();
    await settle();
    expect(text('error')).toBe('flag');
    expect(text('data')).toBeUndefined();
    ds.hasError$.disable();
    await settle();
    expect(text('error')).toBeUndefined();
  });

  it('refresh from the error context refreshes the data source', async () => {
    const refresh = jest.spyOn(ds, 'refresh');
    await settle();
    ds.hasError$.enable();
    await settle();
    fixture.nativeElement.querySelector('#refresh').click();
    expect(refresh).toHaveBeenCalled();
  });

  it('skips the error template when none is defined', async () => {
    await settle();
    jest.spyOn(directive(), 'errorTemplate' as any).mockReturnValue(undefined);
    expect(() => directive().embedErrorTemplate(null)).not.toThrow();
  });

  it('stops listening to hasError$ after destroy', async () => {
    await settle();
    const embedError = jest.spyOn(directive(), 'embedErrorTemplate');
    fixture.destroy();
    ds.hasError$.enable();
    expect(embedError).not.toHaveBeenCalled();
  });

  it('disconnects on destroy and exposes the context guard', async () => {
    await settle();
    const disconnect = jest.spyOn(ds, 'disconnect');
    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
    expect(DataSourceDirective.ngTemplateContextGuard({} as any, {})).toBe(true);
  });
});
