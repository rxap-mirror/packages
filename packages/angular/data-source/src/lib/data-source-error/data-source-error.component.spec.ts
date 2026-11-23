import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataSourceErrorComponent } from './data-source-error.component';

describe('DataSourceErrorComponent', () => {
  let fixture: ComponentFixture<DataSourceErrorComponent>;

  const create = (env: any = { tier: 'development', tag: 'v1.0.0-dev.1' }) => {
    TestBed.configureTestingModule({ providers: [{ provide: RXAP_ENVIRONMENT, useValue: env }] });
    fixture = TestBed.createComponent(DataSourceErrorComponent);
  };
  const set = (name: string, value: unknown) => fixture.componentRef.setInput(name, value);
  const buttons = () => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
  const flush = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('shows no buttons without refresh, retry or reset', async () => {
    create();
    await flush();
    expect(buttons()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Something has gone wrong!');
  });

  it('retry prefers retry over refresh and shows a spinner while in progress', async () => {
    create();
    const retry = vi.fn();
    const refresh = vi.fn();
    set('retry', retry);
    set('refresh', refresh);
    await flush();
    buttons()[0].click();
    await flush();
    expect(retry).toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(fixture.componentInstance.retryInProgress()).toBe(true);
    expect(buttons()[0].disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
  });

  it('falls back to refresh', async () => {
    create();
    const refresh = vi.fn();
    set('refresh', refresh);
    await flush();
    buttons()[0].click();
    expect(refresh).toHaveBeenCalled();
  });

  it('uses the data source like fallbacks and lets explicit inputs win', async () => {
    create();
    const like = { refresh: vi.fn(), reset: vi.fn() };
    set('dataSourceLike', like);
    await flush();
    expect(buttons()).toHaveLength(2);
    buttons()[1].click();
    expect(like.reset).toHaveBeenCalled();
    expect(fixture.componentInstance.resetInProgress()).toBe(true);
    const reset = vi.fn();
    set('reset', reset);
    await flush();
    fixture.componentInstance.triggerReset();
    expect(reset).toHaveBeenCalled();
  });

  it('ends the progress when loading turns false or a new error arrives', async () => {
    create();
    const loading$ = new BehaviorSubject(true);
    set('retry', vi.fn());
    set('loading', loading$);
    await flush();
    fixture.componentInstance.triggerRetry();
    expect(fixture.componentInstance.retryInProgress()).toBe(true);
    loading$.next(false);
    expect(fixture.componentInstance.retryInProgress()).toBe(false);

    fixture.componentInstance.triggerRetry();
    set('error', new Error('another'));
    await flush();
    expect(fixture.componentInstance.retryInProgress()).toBe(false);
  });

  it('a plain false loading flag ends the progress', async () => {
    create();
    set('retry', vi.fn());
    set('loading', true);
    await flush();
    fixture.componentInstance.triggerRetry();
    set('loading', false);
    await flush();
    expect(fixture.componentInstance.retryInProgress()).toBe(false);
  });

  it('shows the error message of an error observable on non release versions', async () => {
    create();
    const error$ = new Subject<any>();
    set('error', error$);
    await flush();
    error$.next({ message: 'boom' });
    await flush();
    expect(fixture.componentInstance.errorMessage()).toBe('boom');
    expect(fixture.nativeElement.textContent).toContain('boom');
    error$.next(null);
    expect(fixture.componentInstance.errorMessage()).toBe('boom');
  });

  it('hides the message on release versions', async () => {
    create({ tier: 'production', tag: 'v1.0.0' });
    await flush();
    expect(fixture.nativeElement.querySelector('.text-red-700')).toBeNull();
  });

  it('trigger methods do nothing without handlers', async () => {
    create();
    await flush();
    fixture.componentInstance.triggerRetry();
    fixture.componentInstance.triggerReset();
    expect(fixture.componentInstance.retryInProgress()).toBe(false);
    expect(fixture.componentInstance.resetInProgress()).toBe(false);
  });
});
