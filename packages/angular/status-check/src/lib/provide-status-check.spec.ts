import { TestBed } from '@angular/core/testing';
import { STATUS_CHECK_ROUTE } from './status-check.routes';
import { ProvideStatusCheck, withStatusCheckInterval, withStatusIndicatorInterval } from './provide-status-check';
import { STATUS_CHECK_INTERVAL, STATUS_INDICATOR_INTERVAL } from './tokens';

describe('status check providers', () => {
  it('flattens providers', () => {
    expect(ProvideStatusCheck({ provide: 'a', useValue: 1 }, [{ provide: 'b', useValue: 2 }])).toHaveLength(2);
  });

  it('provides interval overrides', () => {
    TestBed.configureTestingModule({
      providers: [ProvideStatusCheck(withStatusCheckInterval(7), withStatusIndicatorInterval(9))],
    });
    expect(TestBed.inject(STATUS_CHECK_INTERVAL)).toBe(7);
    expect(TestBed.inject(STATUS_INDICATOR_INTERVAL)).toBe(9);
  });

  it('has defaults', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(STATUS_CHECK_INTERVAL)).toBeGreaterThan(0);
    expect(TestBed.inject(STATUS_INDICATOR_INTERVAL)).toBeGreaterThan(0);
  });

  it('defines the route', () => {
    expect(STATUS_CHECK_ROUTE.path).toBe('status-check');
  });
});
