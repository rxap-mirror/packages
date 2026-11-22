import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { ConfigService } from '@rxap/config';
import { Subject, of } from 'rxjs';
import { StatusCheckService } from '../status-check.service';
import { STATUS_INDICATOR_INTERVAL } from '../tokens';
import { StatusIndicatorComponent } from './status-indicator.component';

describe('StatusIndicatorComponent', () => {
  const service = { getStatus: jest.fn() };

  function create() {
    service.getStatus.mockReset();
    service.getStatus.mockReturnValue(of({ status: 'ok' }));
    TestBed.configureTestingModule({
      imports: [StatusIndicatorComponent],
      providers: [
        provideRouter([]),
        { provide: StatusCheckService, useValue: service },
        { provide: STATUS_INDICATOR_INTERVAL, useValue: 2 },
        {
          provide: ConfigService,
          useValue: {
            get: () => ({ a: { statusCheck: true }, b: { statusCheck: false }, c: 'x', d: null }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(StatusIndicatorComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('collects services with statusCheck enabled and shows status', () => {
    const fixture = create();
    const c = fixture.componentInstance;
    expect(c.services).toEqual(['a']);
    expect(c.status()).toBe('ok');
    expect(c.tooltip()).toContain('ok');
    expect(fixture.nativeElement.querySelector('.bg-green-500')).toBeTruthy();
  });

  it('exposes query params after navigation', () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    (router.events as unknown as Subject<any>).next(new NavigationEnd(1, '/a', '/b'));
    expect(fixture.componentInstance.queryParams()).toEqual({ url: '/b', service: ['a'] });
  });

  it('retries on the interval', () => {
    const fixture = create();
    jest.advanceTimersByTime(2000);
    jest.advanceTimersByTime(600);
    expect(service.getStatus).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.countdown()).toBeLessThanOrEqual(2);
  });
});
