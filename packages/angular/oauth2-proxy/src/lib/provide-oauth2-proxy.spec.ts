import { TestBed } from '@angular/core/testing';
import {
  PubSubService,
  RXAP_TOPICS,
} from '@rxap/ngx-pub-sub';
import { Subject } from 'rxjs';
import {
  provideOauth2Proxy,
  subscribeToLogoutEvent,
} from './provide-oauth2-proxy';

describe('subscribeToLogoutEvent', () => {
  // jsdom does not allow stubbing location.replace; a navigation attempt is
  // reported as a "not implemented" error on the console instead.
  let consoleError: jest.SpyInstance;
  const navigated = () => consoleError.mock.calls.some(([e]) => String(e?.message ?? e).includes('navigation'));

  beforeEach(() => {
    jest.useFakeTimers();
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleError.mockRestore();
  });

  it('signs out after the debounce when a logout event is published', () => {
    const subject = new Subject<any>();
    const pubSub = { subscribe: jest.fn(() => subject.asObservable()) } as unknown as PubSubService;
    subscribeToLogoutEvent(pubSub)();
    expect(pubSub.subscribe).toHaveBeenCalledWith(RXAP_TOPICS.authentication.logout);
    subject.next(true);
    jest.advanceTimersByTime(63);
    expect(navigated()).toBe(false);
    jest.advanceTimersByTime(1);
    expect(navigated()).toBe(true);
  });

  it('provideOauth2Proxy registers an app initializer subscribing to logout', async () => {
    const subject = new Subject<any>();
    const subscribe = jest.fn(() => subject.asObservable());
    TestBed.configureTestingModule({
      providers: [{ provide: PubSubService, useValue: { subscribe } }, provideOauth2Proxy()],
    });
    TestBed.inject(PubSubService);
    await TestBed.inject(
      (await import('@angular/core')).ApplicationInitStatus,
    ).donePromise;
    expect(subscribe).toHaveBeenCalledWith(RXAP_TOPICS.authentication.logout);
  });
});
