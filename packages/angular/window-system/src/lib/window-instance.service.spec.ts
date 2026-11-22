import { Subject } from 'rxjs';
import { WindowInstanceService } from './window-instance.service';

describe('WindowInstanceService', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('forwards the truthiness of attached streams to loading$', () => {
    const service = new WindowInstanceService();
    const values: boolean[] = [];
    service.loading$.subscribe((v) => values.push(v));
    const source = new Subject<any>();
    service.attachLoading(source);
    source.next('x');
    jest.advanceTimersByTime(1);
    source.next(0);
    jest.advanceTimersByTime(1);
    expect(values).toEqual([false, true, false]);
  });

  it('stops forwarding after destroy', () => {
    const service = new WindowInstanceService();
    const values: boolean[] = [];
    service.loading$.subscribe((v) => values.push(v));
    const source = new Subject<any>();
    service.attachLoading(source);
    service.ngOnDestroy();
    source.next(true);
    jest.advanceTimersByTime(1);
    expect(values).toEqual([false]);
  });
});
