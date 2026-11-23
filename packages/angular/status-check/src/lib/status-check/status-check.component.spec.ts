import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { StatusCheckService } from '../status-check.service';
import { STATUS_CHECK_INTERVAL } from '../tokens';
import { StatusCheckComponent } from './status-check.component';

describe('StatusCheckComponent', () => {
  const service = { getStatus: vi.fn() };
  let params: BehaviorSubject<any>;

  function create(status: any, query: Record<string, any> = { service: ['a'] }) {
    params = new BehaviorSubject(convertToParamMap(query));
    service.getStatus.mockReset();
    service.getStatus.mockReturnValue(of(status));
    TestBed.configureTestingModule({
      imports: [StatusCheckComponent],
      providers: [
        provideRouter([]),
        { provide: StatusCheckService, useValue: service },
        { provide: STATUS_CHECK_INTERVAL, useValue: 3 },
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
      ],
    });
    const fixture = TestBed.createComponent(StatusCheckComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('maps services and flags from the status', () => {
    const fixture = create({
      status: 'error',
      info: { b: { status: 'up' } },
      error: { a: { status: 'down', message: 'bad' } },
    }, { service: ['a', 'b'], url: '/back' });
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.services().map((s) => s.name)).toEqual(['a', 'b']);
    expect(c.services()[0].message).toBe('bad');
    expect(c.statusIsError()).toBe(true);
    expect(c.statusIsOk()).toBe(false);
    expect(c.statusIsAvailable()).toBe(true);
    expect(c.statusIsUnavailable()).toBe(false);
    expect(c.url()).toBe('/back');
    expect(fixture.nativeElement.textContent).toContain('down');
    expect(c.trackBy(0, c.services()[0])).toBe('a');
  });

  it('flags ok, empty and fatal', () => {
    for (const [status, flag] of [['ok', 'statusIsOk'], ['empty', 'statusIsEmpty'], ['fatal', 'statusIsFatal']] as const) {
      TestBed.resetTestingModule();
      const fixture = create({ status });
      vi.advanceTimersByTime(100);
      expect((fixture.componentInstance as any)[flag]()).toBe(true);
      fixture.detectChanges();
    }
  });

  it('flags unavailable states', () => {
    const fixture = create({ status: 'bad-gateway' });
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(fixture.componentInstance.statusIsUnavailable()).toBe(true);
  });

  it('toggles the redirect warning', () => {
    const fixture = create({ status: 'error', error: { a: { status: 'down' } } }, { service: ['a'], url: '/x' });
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    const c = fixture.componentInstance;
    c.openWarningDialog();
    expect(c.showRedirectWarning()).toBe(true);
    c.onCancel();
    expect(c.showRedirectWarning()).toBe(false);
  });

  it('counts down and retries when the interval elapses', () => {
    const fixture = create({ status: 'ok', info: { a: { status: 'up' } } });
    vi.advanceTimersByTime(100);
    const c = fixture.componentInstance;
    expect(service.getStatus).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(c.countdown()).toBe(3);
    vi.advanceTimersByTime(1000);
    expect(c.countdown()).toBe(2);
    vi.advanceTimersByTime(1000);
    expect(c.countdown()).toBe(1);
    vi.advanceTimersByTime(200);
    expect(service.getStatus).toHaveBeenCalledTimes(2);
  });
});
