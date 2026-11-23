import type { Mock } from 'vitest';
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
  // jsdom does not implement navigation (and location.replace cannot be spied
  // on), so the global location is replaced by a stub that records the redirect.
  let replace: Mock;
  const navigated = () => replace.mock.calls.some(([target]: any[]) => target === 'http://localhost/oauth2/sign_out');

  beforeEach(() => {
    vi.useFakeTimers();
    replace = vi.fn();
    vi.stubGlobal('location', { origin: 'http://localhost', replace });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('signs out after the debounce when a logout event is published', () => {
    const subject = new Subject<any>();
    const pubSub = { subscribe: vi.fn(() => subject.asObservable()) } as unknown as PubSubService;
    subscribeToLogoutEvent(pubSub)();
    expect(pubSub.subscribe).toHaveBeenCalledWith(RXAP_TOPICS.authentication.logout);
    subject.next(true);
    vi.advanceTimersByTime(63);
    expect(navigated()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(navigated()).toBe(true);
  });

  it('provideOauth2Proxy registers an app initializer subscribing to logout', async () => {
    const subject = new Subject<any>();
    const subscribe = vi.fn(() => subject.asObservable());
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
